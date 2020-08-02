import { Socket } from 'socket.io';
const serverIO = require('socket.io')();

class ConnectionRequest {
    constructor(public room: string, public src: string) { }
}

class ConnectionResponse {
    constructor(public room: string, public offer: RTCSessionDescriptionInit, public src: string, public dest: string) { }
}

class ConnectionInform {
    constructor(public room: string, public answer: RTCSessionDescriptionInit, public src: string, public dest: string) { }
}

class CandidateInform {
    constructor(public room: string, public candidate: RTCIceCandidate, public src: string, public dest: string) { }
}

serverIO.on('connection', (socket: Socket) => {

    socket.on('join-room', (room: string) => {
        socket.join(room);
        socket.to(room).emit('peer-connection-request', new ConnectionRequest(room, socket.id));
    });

    socket.on('leave-room', (room: string) => {
        socket.leave(room);
    });

    socket.on('peer-connection-response', (response: ConnectionResponse) => {
        socket.to(response.dest).emit('peer-connection-inform', response);
    });

    socket.on('peer-connection-inform', (inform: ConnectionInform) => {
        socket.to(inform.dest).emit('peer-connection-handshake', inform);
    });

    socket.on('peer-candidate-inform', (inform: CandidateInform) => {
        socket.to(inform.dest).emit('peer-candidate-inform', inform);
    });

    socket.on('room-size-request', (room: string) => {
        let num = 0;
        if (socket.adapter.rooms[room] != null) num = Object.keys(socket.adapter.rooms[room].sockets).length;
        socket.emit('room-size-response', { room: room, num: num });
    });
});

serverIO.listen(8008);

import client_io = require('socket.io-client');
const serverAddress = 'http://localhost:8008';

const stunConfig = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302',
        },
    ],
};

class PeerConnection {
    connection: RTCPeerConnection;
    channel?: RTCDataChannel;
    hasCandidate?: boolean;

    constructor() {
        this.connection = new RTCPeerConnection(stunConfig);
    }

    createDataChannel(name: string) {
        this.channel = this.connection.createDataChannel(name);
    }
}

abstract class BasePeer {
    serverSocket: Socket.Socket;
    socketId?: string;
    rooms: {
        [name: string]: {
            [id: string]: PeerConnection;
        }
    };
    roomSizes: {
        [name: string]: number;
    };

    constructor() {
        this.serverSocket = client_io(serverAddress);
        this.rooms = {};
        this.roomSizes = {};

        this.serverSocket.on('connect', () => this.socketId = this.serverSocket.id);
        this.serverSocket.on('peer-connection-request', (request: ConnectionRequest) => this.onConnectionRequest(request));
        this.serverSocket.on('peer-connection-inform', (response: ConnectionResponse) => this.onConnectionInform(response));
        this.serverSocket.on('peer-connection-handshake', (inform: ConnectionInform) => this.onConnectionHandshake(inform));
        this.serverSocket.on('peer-candidate-inform', (inform: CandidateInform) => this.onCandidateInform(inform));
        this.serverSocket.on('room-size-response', ({ room, num }) => this.onRoomSizeResponse(room, num));
    }

    numConnectionInRoom(room: string) {
        return Object.keys(this.rooms[room]).length;
    }

    join(room: string) {
        this.rooms[room] = {};
        this.serverSocket.emit('room-size-request', room);
    }

    leave(room: string) {
        this.rooms[room] = {};
        this.serverSocket.emit('leave-room', room);
    }

    onRoomSizeResponse(room: string, num: number) {
        this.roomSizes[room] = num;
        this.serverSocket.emit('join-room', room);
        if (this.roomSizes[room] === 0) this.onConnected(room);
    }

    async onConnectionRequest(request: ConnectionRequest) {
        const { room, src } = request;
        const connection = new PeerConnection();
        this.rooms[room][src] = connection;

        connection.createDataChannel('data-channel');
        connection.connection.onicecandidate = (candidateEvent: RTCPeerConnectionIceEvent) => this.onIceCandidate(candidateEvent, room, src);

        if (connection.channel) {
            connection.channel.onopen = () => this.onConnection(room, src);
            connection.channel.onmessage = (messageEvent: MessageEvent) => this.onMessage(messageEvent, room, src);
        }

        const offer = await connection.connection.createOffer();
        connection.connection.setLocalDescription(offer);

        this.serverSocket.emit('peer-connection-response', new ConnectionResponse(room, offer, this.socketId ?? '', src));
    }

    async onConnectionInform(response: ConnectionResponse) {
        const { room, offer, src, dest } = response;
        const connection = new PeerConnection();
        this.rooms[room][src] = connection;

        connection.connection.setRemoteDescription(offer);
        connection.connection.ondatachannel = (channelEvent: RTCDataChannelEvent) => this.onDataChannel(channelEvent, room, src);

        const answer = await connection.connection.createAnswer();
        connection.connection.setLocalDescription(answer);

        this.serverSocket.emit('peer-connection-inform', new ConnectionInform(room, answer, this.socketId ?? '', src));
    }

    onConnectionHandshake(inform: ConnectionInform) {
        const { room, answer, src, dest } = inform;
        this.rooms[room][src].connection.setRemoteDescription(answer);
    }

    onDataChannel(channelEvent: RTCDataChannelEvent, room: string, socketId: string) {
        const connection = this.rooms[room][socketId];
        connection.channel = channelEvent.channel;
        connection.channel.onopen = () => this.onConnection(room, socketId);
        connection.channel.onmessage = (messageEvent: MessageEvent) => this.onMessage(messageEvent, room, socketId);
    }

    onIceCandidate(candidateEvent: RTCPeerConnectionIceEvent, room: string, socketId: string) {
        const connection = this.rooms[room][socketId]
        if (connection.hasCandidate) return;
        connection.hasCandidate = true;
        if (candidateEvent.candidate)
            this.serverSocket.emit('peer-candidate-inform', new CandidateInform(room, candidateEvent.candidate, this.socketId ?? '', socketId));
    }

    onCandidateInform(inform: CandidateInform) {
        const { room, candidate, src, dest } = inform;
        this.rooms[room][src].connection.addIceCandidate(candidate);
    }

    onConnection(room: string, socketId: string) {
        if (this.numConnectionInRoom(room) === this.roomSizes[room] - 1) this.onConnected(room);
        // console.log(`${room}: ${this.socketId}: connection established with ${socketId}`);
    }

    onMessage(messageEvent: MessageEvent, room: string, socketId: string) {
        console.log(`${room}: ${this.socketId}: received data ${messageEvent.data} from ${socketId}`);
    }

    onConnected(room: string) {
        console.log(`${this.socketId}: joined ${room}`);
    }
}

class DataEvent {
    constructor(public type: string, public data: any) { }
}

export class Peer extends BasePeer {
    private _events: {
        [type: string]: Function
    };

    constructor() {
        super();

        this._events = {
            'connected': (room: string) => {
                console.log(`${this.socketId}: joined ${room}`);
            },
            'message': (data: any) => {
                console.log(data);
            },
            'data': (data: any) => {
                console.log(data);
            }
        }
    }

    onConnected(room: string) {
        this._events['connected'](room);
    }

    onMessage(messageEvent: MessageEvent, room: string, socketId: string) {
        const dataEvent = JSON.parse(messageEvent.data);

        if (this._events[dataEvent.type]) {
            this._events[dataEvent.type](dataEvent.data);
            return;
        }
        this._events['data'](dataEvent.data);
    }

    on(eventType: string, callback: Function) {
        this._events[eventType] = callback;
    }

    emit(room: string, socketId: string, type: string, data: any) {
        this.rooms[room][socketId].channel?.send(JSON.stringify(new DataEvent(type, data)));
    }

    send(room: string, socketId: string, data: any) {
        this.emit(room, socketId, 'message', data);
    }

    broadcast(room: string, type: string, data: any) {
        Object.keys(this.rooms[room]).forEach((socketId: string) => {
            this.emit(room, socketId, type, data);
        });
    }
}