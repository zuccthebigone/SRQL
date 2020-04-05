const { v4 } = require("uuid");
const uuid = v4;
const { Client } = require("pg");

interface DatabaseConfiguration {
	readonly host: string;
	readonly user: string;
	readonly password: string;
	readonly database: string;
	readonly port: number;
}

const srqlDBConfig: DatabaseConfiguration = {
	host: "localhost",
	user: "postgres",
	password: "password",
	database: "srql",
	port: 5432,
};

export class ClientFactory {
	async new() {
		const client = new Client(srqlDBConfig);
		await client.connect();
		return client;
	}
}
