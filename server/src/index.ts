import express = require("express");
import { authenticate, register } from "./security";
import { User } from "./user/User";

const app = express();

const PORT = 9000;

app.use(express.json()); // for parsing application/json

app.post("/register", (request, response) => {
	const user = request.body;
	register(user, (user: User) => response.send(user));
});

app.post("/authenticate", (request, response) => {
	const user = request.body;
	authenticate(user, (user: User) => response.send(user));
});

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}...`);
});
