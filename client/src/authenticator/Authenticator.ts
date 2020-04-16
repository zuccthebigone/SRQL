class Authenticator extends Observer<Client> {
	constructor(client: Client) {
		super(client);
	}

	update(user: User): void {
		const isAuthenticated = user.id !== "";
		(<HTMLInputElement>document.getElementById("txt-id")).setAttribute(
			"placeholder",
			isAuthenticated ? user.id : "ID goes here"
		);
		(<HTMLInputElement>document.getElementById("txt-username")).setAttribute(
			"placeholder",
			isAuthenticated ? user.username : "Username goes here"
		);
		(<HTMLInputElement>(
			document.getElementById(isAuthenticated ? "vw-auth" : "vw-main")
		)).setAttribute("hidden", "");
		(<HTMLInputElement>(
			document.getElementById(isAuthenticated ? "vw-main" : "vw-auth")
		)).removeAttribute("hidden");
	}
}
