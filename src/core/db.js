const { v4 } = require("uuid");
const uuid = v4;
const { Client } = require("pg");

const db_config = {
    host: "localhost",
    user: "postgres",
    password: "password",
    database: "srql",
    port: 5432,
};

class ClientFactory {
    async new() {
        const client = new Client(db_config);
        await client.connect();
        return client;
    }
}

module.exports = {
    ClientFactory,
};