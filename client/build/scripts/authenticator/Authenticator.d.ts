declare class Authenticator extends Observer<Client> {
    constructor(client: Client);
    update(user: User): void;
}
