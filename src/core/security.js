const crypto = require("crypto");
const { ClientFactory } = require("./db.js");

const username = "zuccthebigone";
const password = "password123";

const colours = ["804a6f", "4a7b80", "b86124", "c34691", "63a1a8", "2a2a2a", "7a3fba", "2c853b", "5b5b68", "4f4a80"];
const salt = "piB4nd0fF1v3";

function hash_password(password) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

async function authenticate(username, password) {
    const clientFactory = new ClientFactory();
    const client = await clientFactory.new();
    const { rowCount, rows } = await client.query(`SELECT DISTINCT id, name FROM public.user WHERE username=$1::text AND password=$2::text`, [username, password]);
    if (rowCount === 0) return null;
    return rows[0];
}

module.exports = {
    hash_password,
    authenticate,
};