const { v4 } = require("uuid");
const uuid = v4;
const crypto = require("crypto");
const fs = require("fs");
const parser = require("csvtojson");
const { Client } = require("pg");
const { Kippy } = require("./kippy.js");

const client = new Client({
    host: "localhost",
    user: "postgres",
    password: "password",
    database: "srql",
    port: 5432
});

var colours = ["804a6f", "4a7b80", "b86124", "c34691", "63a1a8", "2a2a2a", "7a3fba", "2c853b", "5b5b68", "4f4a80"];
const salt = "piB4nd0fF1v3";
var user_id;

var username = "zuccthebigone";
var password = "password123";

async function query(q, callback) {
    if (!client._connected) await client.connect();
    var res = await client.query(q);
    if (callback != null) callback(res);
    return res;
}

function hash_password(password) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

module.exports = {
    uuid,
    crypto,
    fs,
    parser,
    hash_password,
    query,
    Kippy
}