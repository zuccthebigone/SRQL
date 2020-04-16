declare const axios: any;
declare const pbkdf2Sync: any;
declare const API_HOSTNAME = "127.0.0.1";
declare const API_PORT = 9000;
declare const SALT = "pib4nd0fF1v3";
declare function hash(password: string): any;
declare function register(user: User, callback: Function): void;
declare function authenticate(user: User, callback: Function): void;
