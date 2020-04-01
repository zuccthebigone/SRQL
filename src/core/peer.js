const io = require("socket.io")();

var open_connections = {};

io.on("connection", client_socket => {
    const srql_rooms = [];

    client_socket.on("register-peer", data => {
        open_connections[data.src_username] = {
            socket: client_socket,
        };
    });

    client_socket.on("join-srql", (data, callback) => {
        srql_rooms.forEach(room => {
            client_socket.leave(room);
        });
        srql_rooms.push(data.srql_id);
        client_socket.join(data.srql_id);
        client_socket.to(data.srql_id).emit("connection-request", {
            src_username: data.src_username,
        });
        callback(Object.keys(client_socket.adapter.rooms[data.srql_id].sockets).filter(id => { return id !== client_socket.id }).length);
    });

    client_socket.on("connection-inform", (data, callback) => {
        open_connections[data.dest_username].socket.emit("connection-inform", data, address => {
            callback(address);
        });
    });

    client_socket.on("candidate-inform", (data, callback) => {
        open_connections[data.dest_username].socket.emit("candidate-inform", data, () => {
            callback();
        });
    });

    client_socket.on("disconnect", () => {
        Object.keys(open_connections).forEach(username => {
            if (open_connections[username] === client_socket) delete open_connections[username];
        });
    });
});

io.listen(8008);





const client_io = require("socket.io-client");

const config = {
    iceServers: [{
        urls: "stun:stun.l.google.com:19302",
    }],
};

const server_address = "http://localhost:8008";

class Peer {
    constructor(username) {
        this.username = username;
        this.server_socket = client_io(server_address);
        this.peer_connections = {};
        this.events = {
            "data": message => { console.log(message) },
        };

        this.server_socket.on("connect", () => {
            this.server_socket.emit("register-peer", {
                src_username: this.username,
            });
        });

        this.server_socket.on("connection-request", data => this.handle_connection_request(data));
        this.server_socket.on("connection-inform", (data, callback) => this.handle_connection_inform(data, callback));
        this.server_socket.on("candidate-inform", (data, callback) => this.handle_candidate_inform(data, callback));
    }

    handle_connection_request(data) {

        this.peer_connections[data.src_username] = {
            connection: new RTCPeerConnection(config),
            channel: null,
        };

        this.peer_connections[data.src_username].channel = this.peer_connections[data.src_username].connection.createDataChannel("data-channel");

        this.peer_connections[data.src_username].connection.createOffer().then(local_address => {
            this.peer_connections[data.src_username].connection.setLocalDescription(local_address);
            this.server_socket.emit("connection-inform", {
                src_username: this.username,
                dest_username: data.src_username,
                remote_address: local_address,
            }, remote_address => {
                this.peer_connections[data.src_username].connection.setRemoteDescription(remote_address);
            });
        });

        let has_candidate = false;

        this.peer_connections[data.src_username].connection.onicecandidate = connection => {
            if (!connection.isTrusted || has_candidate) return;
            has_candidate = true;
            this.server_socket.emit("candidate-inform", {
                src_username: this.username,
                dest_username: data.src_username,
                candidate: connection.candidate,
            }, () => {
                // candidate set
            });
        }

        this.peer_connections[data.src_username].channel.onmessage = message_event => this.handle_message_event(message_event);
    }

    handle_connection_inform(data, callback) {

        this.peer_connections[data.src_username] = {
            connection: new RTCPeerConnection(config),
            channel: null,
        };

        this.peer_connections[data.src_username].connection.setRemoteDescription(new RTCSessionDescription(data.remote_address));

        this.peer_connections[data.src_username].connection.createAnswer().then(local_address => {
            this.peer_connections[data.src_username].connection.setLocalDescription(local_address);
            callback(local_address);
        });

        this.peer_connections[data.src_username].connection.ondatachannel = connection => {
            if (!connection.isTrusted) return;
            this.peer_connections[data.src_username].channel = connection.channel;
            this.peer_connections[data.src_username].channel.onmessage = message_event => this.handle_message_event(message_event);
            this.peer_connections[data.src_username].channel.onopen = () => {
                this.emit(data.src_username, "peer-connected", { src_username: data.src_username, dest_username: this.username, message: "success" });
                this.handle_message({ type: "peer-connected", data: { src_username: this.username, dest_username: data.src_username, message: "success" } });
            }
        };
    }

    handle_candidate_inform(data, callback) {
        this.peer_connections[data.src_username].connection.addIceCandidate(data.candidate);
        callback();
    }

    handle_message_event(message_event) {
        if (!message_event.isTrusted) return;
        const message = JSON.parse(message_event.data);
        this.handle_message(message);
    }

    handle_message(message) {
        if (this.events[message.type] === undefined) {
            this.events["data"](message);
            return;
        }
        this.events[message.type](message.data);
    }

    connect(srql_id) {
        this.peer_connections = {};
        this.open_connections = 0;
        this.server_socket.emit("join-srql", {
            src_username: this.username,
            srql_id: srql_id,
        }, srql_size => {
            // TODO: emit connected event when srql size matches open connections
        });
    }

    emit(dest_username, data_type, data) {
        const data_string = JSON.stringify({ type: data_type, data: data });
        this.peer_connections[dest_username].channel.send(data_string);
    }

    broadcast(data_type, data) {
        Object.keys(this.peer_connections).forEach(peer_username => {
            this.emit(peer_username, data_type, data);
        });
    }

    broadcast_to(peer_usernames, data_type, data) {
        peer_usernames.forEach(peer_username => {
            this.emit(peer_username, data_type, data);
        });
    }

    on(event_type, callback) {
        this.events[event_type] = callback;
    }
}

module.exports = {
    Peer: Peer,
}