// // --------------------------------- SERVER ------------------------------------

// import { Socket } from "socket.io";

// const io = require("socket.io")();

// class RoomJoinRequest {
// 	constructor(public peer: string, public room: string) {}
// }

// class PeerConnectionRequest {
// 	constructor(
// 		public src: string,
// 		public address: RTCSessionDescriptionInit,
// 		public dest?: string
// 	) {}
// }

// class PeerCandidateRequest {
// 	constructor(
// 		public src: string,
// 		public candidate: RTCIceCandidate,
// 		public dest?: string
// 	) {}
// }

// class Details {
// 	constructor(public socket: Socket, public room: string = null) {}
// }

// interface PeerDetails {
// 	[peer: string]: Details;
// }

// let peerDetails: PeerDetails;

// function room_members(room: string) {
// 	return Object.values(peerDetails).filter(
// 		(details: Details) => details.room === room
// 	);
// }

// io.on("connection", (socket: Socket) => {
// 	// Registers peer
// 	socket.on(
// 		"register-peer",
// 		(peer: string) => (peerDetails[peer] = new Details(socket))
// 	);

// 	// Switches peer to room and sends connection requests to all room members
// 	socket.on("join-room", ({ peer, room }: RoomJoinRequest, callback) => {
// 		if (!peerDetails[peer]) return;
// 		if (peerDetails[peer].room) socket.leave(peerDetails[peer].room);
// 		socket.join(room);
// 		peerDetails[peer].room = room;
// 		socket.to(room).emit("connection-request", peer);
// 		callback(room_members(room).length);
// 	});

// 	// Forwards connection details to requesting peer
// 	socket.on(
// 		"connection-inform",
// 		({ src, dest, address }: PeerConnectionRequest, callback) =>
// 			peerDetails[dest].socket.emit(
// 				"connection-inform",
// 				new PeerConnectionRequest(src, address),
// 				callback
// 			)
// 	);

// 	// Forwards candidate details to requesting peer
// 	socket.on(
// 		"candidate-inform",
// 		({ src, dest, candidate }: PeerCandidateRequest, callback) =>
// 			peerDetails[dest].socket.emit(
// 				"candidate-inform",
// 				new PeerCandidateRequest(src, candidate),
// 				callback
// 			)
// 	);

// 	// Removes peer from rooms
// 	socket.on("disconnect", () =>
// 		Object.entries(peerDetails).forEach(
// 			([peer, details]: [string, Details]) => {
// 				if (details.socket === socket) delete peerDetails[peer];
// 			}
// 		)
// 	);
// });

// io.listen(8008);

// // ----------------------------------- PEER ------------------------------------

// import client_io = require("socket.io-client");

// const stun_config = {
// 	iceServers: [
// 		{
// 			urls: "stun:stun.l.google.com:19302",
// 		},
// 	],
// };

// const server_address = "http://localhost:8008";

// class Connection {
// 	constructor(
// 		public connection: RTCPeerConnection,
// 		public channel?: RTCDataChannel
// 	) {}
// }

// export class Peer {
// 	server: SocketIOClient.Socket;
// 	connections: {
// 		[peer: string]: Connection;
// 	};
// 	events: {
// 		[type: string]: Function;
// 	};

// 	constructor(public id: string) {
// 		this.server = client_io(server_address);
// 		this.events = {
// 			data: console.log,
// 		};

// 		this.server.on("connect", () => this.register_with_server());
// 		this.server.on("connection-request", (other_peer: string) =>
// 			this.establish_connection(other_peer)
// 		);
// 		this.server.on("connection-inform", (data, callback) =>
// 			this.handle_connection_inform(data, callback)
// 		);
// 		this.server.on("candidate-inform", (data, callback) =>
// 			this.handle_candidate_inform(data, callback)
// 		);
// 	}

// 	register_with_server() {
// 		this.server.emit("register-peer", this.id);
// 	}

// establish_connection(other_peer: string) {
// 	const connection = new RTCPeerConnection(stun_config);
// 	const channel = connection.createDataChannel("data-channel");

// 	this.connections[other_peer] = new Connection(connection, channel);

// 	connection.createOffer().then((local_address) => {
// 		connection.setLocalDescription(local_address);
// 		this.server.emit(
// 			"connection-inform",
// 			new PeerConnectionRequest(this.id, local_address, other_peer),
// 			(address: RTCSessionDescriptionInit) =>
// 				connection.setRemoteDescription(address)
// 		);
// 	});

// 		let has_candidate = false;

// 		connection.onicecandidate = ({ isTrusted, candidate }) => {
// 			if (!isTrusted || has_candidate) return;
// 			has_candidate = true;
// 			this.server.emit(
// 				"candidate-inform",
// 				new PeerCandidateRequest(this.id, candidate, other_peer),
// 				() => {
// 					// candidate set
// 				}
// 			);
// 		};

// 		channel.onmessage = (message_event) =>
// 			this.handle_message_event(message_event);
// 	}

// 	handle_connection_inform({ peer, address }, callback) {
// 		const connection = new RTCPeerConnection(stun_config);
// 		connection.setRemoteDescription(new RTCSessionDescription(address));

// 		this.connections[peer] = { connection: connection };

// 		connection.createAnswer().then((local_address) => {
// 			connection.setLocalDescription(local_address);
// 			callback(local_address);
// 		});

// 		connection.ondatachannel = ({ isTrusted, channel }) => {
// 			if (!isTrusted) return;
// 			channel.onmessage = (message_event) =>
// 				this.handle_message_event(message_event);
// 			channel.onopen = () => {
// 				this.emit(peer, "peer-connected", {
// 					src_peer: peer,
// 					dest_peer: this.id,
// 					message: "success",
// 				});
// 				this.handle_message({
// 					type: "peer-connected",
// 					data: { src_peer: this.id, dest_peer: peer, message: "success" },
// 				});
// 			};
// 			this.connections[peer].channel = channel;
// 		};
// 	}

// 	handle_candidate_inform({ peer, candidate }, callback) {
// 		this.connections[peer].connection.addIceCandidate(candidate);
// 		callback();
// 	}

// 	handle_message_event({ isTrusted, data }) {
// 		if (!isTrusted) return;
// 		const message = JSON.parse(data);
// 		this.handle_message(message);
// 	}

// 	handle_message(message) {
// 		if (this.events[message.type] === undefined) {
// 			this.events.data(message);
// 			return;
// 		}
// 		this.events[message.type](message.data);
// 	}

// 	connect(room: string) {
// 		this.connections = {};
// 		this.server.emit(
// 			"join-room",
// 			new RoomJoinRequest(this.id, room),
// 			(roomSize: number) => {
// 				// TODO: emit connected event when room size matches open connections
// 			}
// 		);
// 	}

// 	emit(peer: string, dataType, data: object | string) {
// 		this.connections[peer].channel.send(
// 			JSON.stringify({ type: dataType, data: data })
// 		);
// 	}

// 	broadcast(data_type, data) {
// 		Object.keys(this.connections).forEach((peer_peer) => {
// 			this.emit(peer_peer, data_type, data);
// 		});
// 	}

// 	broadcast_to(peer_peers, data_type, data) {
// 		peer_peers.forEach((peer_peer) => {
// 			this.emit(peer_peer, data_type, data);
// 		});
// 	}

// 	on(event_type, callback) {
// 		this.events[event_type] = callback;
// 	}
// }

import { Socket } from "socket.io";

const io = require("socket.io")();

class PeerConfirmResponse {
	constructor(
		public address: string,
		public offer: RTCSessionDescriptionInit
	) {}
}

class IceCandidateRequest {
	constructor(public candidate: RTCIceCandidate, public src: string) {}
}

class PeerHandshake {
	constructor(
		public address: string,
		public answer: RTCSessionDescriptionInit
	) {}
}

io.on("connection", (socket: Socket) => {
	socket.on("room-join", (room: string) => {
		console.log(`Server received request to join room ${room}`);
		socket.to(room).emit("peer-connection-request", socket.id);
	});

	socket.on("peer-confirm-response", (response: PeerConfirmResponse) => {
		const { address, offer } = response;
		socket
			.to(address)
			.emit("peer-confirm-response", new PeerConfirmResponse(socket.id, offer));
	});

	socket.on("peer-handshake", (handshake: PeerHandshake) => {
		const { address, answer } = handshake;
		socket
			.to(address)
			.emit("peer-handshake", new PeerHandshake(socket.id, answer));
	});

	socket.on("ice-candidate-request", (request: IceCandidateRequest) => {
		const { candidate, src } = request;
		socket
			.to(src)
			.emit(
				"ice-candidate-request",
				new IceCandidateRequest(candidate, socket.id)
			);
	});
});

io.listen(8008);

// ----------------------------------- PEER ------------------------------------

class PeerConnection {
	constructor(
		public connection: RTCPeerConnection,
		public channel: RTCDataChannel
	) {}
}

import client_io = require("socket.io-client");
import { EventEmitter } from "events";

const stunConfig = {
	iceServers: [
		{
			urls: "stun:stun.l.google.com:19302",
		},
	],
};

const serverAddress = "http://localhost:8008";

export abstract class Peer {
	server: SocketIOClient.Socket;
	connections: {
		[sockId: string]: PeerConnection;
	};

	constructor(public id: string) {
		this.server = client_io(serverAddress);
		this.server.on(
			"peer-connection-request",
			(src: string) => this.onPeerConnectionRequest
		);
		this.server.on(
			"peer-confirm-response",
			(response: PeerConfirmResponse) => this.onPeerConfirmResponse
		);
		this.server.on(
			"peer-handshake",
			(handshake: PeerHandshake) => this.onPeerHandshake
		);
		this.server.on("ice-candidate-request", this.onIceCandidateRequest);
	}

	private async join(room: string) {
		console.log(`Requesting to join room: ${room}...`);
		this.server.emit("room-join", room);
	}

	private onPeerConnectionRequest(src: string) {
		console.log(`Peer received connection request`);
		const connection = new RTCPeerConnection(stunConfig);
		const channel = connection.createDataChannel("data-channel");
		connection.createOffer().then((offer) => {
			connection.setLocalDescription(offer);
			this.server.emit(
				"peer-confirm-response",
				new PeerConfirmResponse(src, offer)
			);
		});
		connection.onicecandidate = (event) => this.onIceCandidate(event, src);
		channel.onmessage = this.onMessage;
		this.connections[src] = new PeerConnection(connection, channel);
	}

	private onPeerConfirmResponse(response: PeerConfirmResponse) {
		const { address, offer } = response;
		const connection = this.connections[address].connection;
		connection.setRemoteDescription(offer);
		connection.createAnswer().then((answer) => {
			this.server.emit("peer-handshake", new PeerHandshake(address, answer));
		});
		connection.ondatachannel = (event: RTCDataChannelEvent) =>
			this.onDataChannel(event, address);
	}

	private onPeerHandshake(handshake: PeerHandshake) {
		const { address, answer } = handshake;
		this.connections[address].connection.setRemoteDescription(answer);
	}

	private onIceCandidate(event: RTCPeerConnectionIceEvent, requester: string) {
		const { candidate } = event;
		if (candidate)
			this.server.emit(
				"ice-candidate-request",
				new IceCandidateRequest(candidate, requester)
			);
	}

	private onIceCandidateRequest(request: IceCandidateRequest) {
		const { candidate, src } = request;
		this.connections[src].connection.addIceCandidate(candidate);
	}

	private onDataChannel(event: RTCDataChannelEvent, address: string) {
		const { channel } = event;
		channel.onmessage = this.onMessage;
		channel.onopen = this.onOpen;
		this.connections[address].channel = channel;
	}

	private onMessage(event: MessageEvent) {
		const { data } = event;
		this.onData(data);
	}

	private onOpen() {
		this.connections[]
	}

	private onData(data: Blob | string) {

	}

	private broadcast()
}
