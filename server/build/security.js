"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const randomUuid = uuid_1.v4;
const db_1 = require("./db");
const cf = new db_1.ClientFactory();
const User_1 = require("./user/User");
async function register({ username, passwordHash, fullname }, callback) {
    const client = await cf.createClient();
    const uuid = randomUuid();
    client
        .query("INSERT INTO public.user VALUES ($1::uuid, $2::text, $3::text, $4::text)", [uuid, username, passwordHash, fullname])
        .then(({ rowCount }) => {
        const isRegistered = rowCount > 0;
        callback(isRegistered
            ? new User_1.User(username, passwordHash, fullname, uuid)
            : new User_1.User());
    })
        .catch((error) => {
        console.log(error);
        callback(new User_1.User());
    });
}
exports.register = register;
async function authenticate({ username, passwordHash }, callback) {
    const client = await cf.createClient();
    client
        .query("SELECT * FROM public.user WHERE username=$1::text AND password=$2::text", [username, passwordHash])
        .then(({ rowCount, rows }) => {
        const isAuthenticated = rowCount > 0;
        const user = rows[0];
        callback(isAuthenticated ? user : new User_1.User());
    })
        .catch((error) => {
        console.log(error);
        callback(new User_1.User());
    });
}
exports.authenticate = authenticate;
