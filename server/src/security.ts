import { v4 } from "uuid";
const randomUuid = v4;
import { ClientFactory } from "./db";
const cf = new ClientFactory();
import { User } from "./user/User";

export async function register(
	{ username, passwordHash, fullname }: User,
	callback: Function
) {
	const client = await cf.createClient();
	const uuid = randomUuid();
	client
		.query(
			"INSERT INTO public.user VALUES ($1::uuid, $2::text, $3::text, $4::text)",
			[uuid, username, passwordHash, fullname]
		)
		.then(({ rowCount }) => {
			const isRegistered = rowCount > 0;
			callback(
				isRegistered
					? new User(username, passwordHash, fullname, uuid)
					: new User()
			);
		})
		.catch((error) => {
			console.log(error);
			callback(new User());
		});
}

export async function authenticate(
	{ username, passwordHash }: User,
	callback: Function
) {
	const client = await cf.createClient();
	client
		.query(
			"SELECT * FROM public.user WHERE username=$1::text AND password=$2::text",
			[username, passwordHash]
		)
		.then(({ rowCount, rows }) => {
			const isAuthenticated = rowCount > 0;
			const user = rows[0];
			callback(isAuthenticated ? user : new User());
		})
		.catch((error) => {
			console.log(error);
			callback(new User());
		});
}
