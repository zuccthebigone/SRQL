import { Client } from "pg";
export declare class ClientFactory {
    createClient(): Promise<Client>;
}
