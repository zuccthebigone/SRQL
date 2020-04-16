import { Client, ClientConfig } from "pg";

const DB_CONFIG: ClientConfig = {
	user: "postgres",
	password: "password",
	database: "srql",
	port: 5432,
};

export class ClientFactory {
	async createClient() {
		const client = new Client(DB_CONFIG);
		await client.connect();
		return client;
	}
}
