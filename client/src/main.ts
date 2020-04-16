const inpUsername = <HTMLInputElement>document.getElementById("inp-username");
const inpPassword = <HTMLInputElement>document.getElementById("inp-password");
const inpFullname = <HTMLInputElement>document.getElementById("inp-fullname");

const btnRegister = <HTMLButtonElement>document.getElementById("btn-register");
const btnAuthenticate = <HTMLButtonElement>(
	document.getElementById("btn-authenticate")
);
const btnLogout = <HTMLButtonElement>document.getElementById("btn-logout");

let client = new Client(new User());
let authenticator = new Authenticator(client);

btnRegister.addEventListener("click", () => {
	register(
		new User(inpUsername.value, hash(inpPassword.value), inpFullname.value),
		(user: User) => (client.state = user)
	);
});

btnAuthenticate.addEventListener("click", () => {
	authenticate(
		new User(inpUsername.value, hash(inpPassword.value)),
		(user: User) => {
			client.state = user;
		}
	);
});

btnLogout.addEventListener("click", () => {
	client.state = new User();
});
