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

async function query(q) {
    var res = await client.query(q);
    return res;
}

module.exports = {
    uuid,
    crypto,
    fs,
    parser,
    client,
    salt,
    query,
    Kippy,
    username,
    password
}