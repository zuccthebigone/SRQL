import { User } from "./user/User";
export declare function register({ username, passwordHash, fullname }: User, callback: Function): Promise<void>;
export declare function authenticate({ username, passwordHash }: User, callback: Function): Promise<void>;
