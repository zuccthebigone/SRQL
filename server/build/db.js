"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const DB_CONFIG = {
    user: "postgres",
    password: "password",
    database: "srql",
    port: 5432,
};
class ClientFactory {
    async createClient() {
        const client = new pg_1.Client(DB_CONFIG);
        await client.connect();
        return client;
    }
}
exports.ClientFactory = ClientFactory;
