"use strict";
// --------------------------------- SERVER ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io")();
const peer_connections = {};
function room_members(room) {
    return Object.values(peer_connections).filter((connection) => connection.room !== room);
}
class PeerConnection {
    constructor(socket, room = null) {
        this.socket = socket;
        this.room = room;
    }
}
io.on("connection", (socket) => {
    // Registers peer
    socket.on("register-peer", (peer) => (peer_connections[peer] = new PeerConnection(socket)));
    // Switches peer to room and sends connection requests to all room members
    socket.on("join-room", ({ peer, room }, callback) => {
        if (!peer_connections[peer])
            return;
        if (peer_connections[peer].room)
            socket.leave(peer_connections[peer].room);
        socket.join(room);
        peer_connections[peer].room = room;
        socket.to(room).emit("peer-connection-request", peer);
        callback(room_members(room).length);
    });
    // Forwards connection details to requesting peer
    socket.on("peer-connection-inform", ({ src_peer, dest_peer, src_address }, callback) => peer_connections[dest_peer].socket.emit("peer-connection-inform", { peer: src_peer, address: src_address }, callback));
    // Forwards candidate details to requesting peer
    socket.on("peer-candidate-inform", ({ src_peer, dest_peer, candidate }, callback) => peer_connections[dest_peer].socket.emit("peer-candidate-inform", { peer: src_peer, candidate: candidate }, callback));
    // Removes peer from rooms
    socket.on("disconnect", () => Object.entries(peer_connections).forEach(([peer, connection]) => {
        if (connection.socket === socket)
            delete peer_connections[peer];
    }));
});
io.listen(8008);
// ----------------------------------- PEER ------------------------------------
const client_io = require("socket.io-client");
const stun_config = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302",
        },
    ],
};
const server_address = "http://localhost:8008";
class Connection {
    constructor(connection, channel) {
        this.connection = connection;
        this.channel = channel;
    }
}
class Peer {
    constructor(id) {
        this.id = id;
        this.server = client_io(server_address);
        this.connections = {};
        this.events = {
            data: console.log,
        };
        this.server.on("connect", () => this.register_with_server());
        this.server.on("peer-connection-request", (other_peer) => this.establish_connection(other_peer));
        this.server.on("peer-connection-inform", (data, callback) => this.handle_connection_inform(data, callback));
        this.server.on("peer-candidate-inform", (data, callback) => this.handle_candidate_inform(data, callback));
    }
    register_with_server() {
        this.server.emit("register-peer", this.id);
    }
    establish_connection(other_peer) {
        const connection = new RTCPeerConnection(stun_config);
        const channel = connection.createDataChannel("data-channel");
        this.connections[other_peer] = new Connection(connection, channel);
        connection.createOffer().then((local_address) => {
            connection.setLocalDescription(local_address);
            this.server.emit("peer-connection-inform", {
                src_peer: this.id,
                dest_peer: other_peer,
                src_address: local_address,
            }, (remote_address) => connection.setRemoteDescription(remote_address));
        });
        let has_candidate = false;
        connection.onicecandidate = ({ isTrusted, candidate }) => {
            if (!isTrusted || has_candidate)
                return;
            has_candidate = true;
            this.server.emit("peer-candidate-inform", {
                src_peer: this.id,
                dest_peer: other_peer,
                candidate: candidate,
            }, () => {
                // candidate set
            });
        };
        channel.onmessage = (message_event) => this.handle_message_event(message_event);
    }
    handle_connection_inform({ peer, address }, callback) {
        const connection = new RTCPeerConnection(stun_config);
        connection.setRemoteDescription(new RTCSessionDescription(address));
        this.connections[peer] = { connection: connection };
        connection.createAnswer().then((local_address) => {
            connection.setLocalDescription(local_address);
            callback(local_address);
        });
        connection.ondatachannel = ({ isTrusted, channel }) => {
            if (!isTrusted)
                return;
            channel.onmessage = (message_event) => this.handle_message_event(message_event);
            channel.onopen = () => {
                this.emit(peer, "peer-connected", {
                    src_peer: peer,
                    dest_peer: this.id,
                    message: "success",
                });
                this.handle_message({
                    type: "peer-connected",
                    data: { src_peer: this.id, dest_peer: peer, message: "success" },
                });
            };
            this.connections[peer].channel = channel;
        };
    }
    handle_candidate_inform({ peer, candidate }, callback) {
        this.connections[peer].connection.addIceCandidate(candidate);
        callback();
    }
    handle_message_event({ isTrusted, data }) {
        if (!isTrusted)
            return;
        const message = JSON.parse(data);
        this.handle_message(message);
    }
    handle_message(message) {
        if (this.events[message.type] === undefined) {
            this.events.data(message);
            return;
        }
        this.events[message.type](message.data);
    }
    connect(room) {
        this.connections = {};
        this.open_connections = 0;
        this.server.emit("join-room", {
            peer: this.id,
            room: room,
        }, (room_size) => {
            // TODO: emit connected event when room size matches open connections
        });
    }
    emit(peer, data_type, data) {
        this.connections[peer].channel.send(JSON.stringify({ type: data_type, data: data }));
    }
    broadcast(data_type, data) {
        Object.keys(this.connections).forEach((peer_peer) => {
            this.emit(peer_peer, data_type, data);
        });
    }
    broadcast_to(peer_peers, data_type, data) {
        peer_peers.forEach((peer_peer) => {
            this.emit(peer_peer, data_type, data);
        });
    }
    on(event_type, callback) {
        this.events[event_type] = callback;
    }
}
exports.Peer = Peer;
//# sourceMappingURL=peer.js.map