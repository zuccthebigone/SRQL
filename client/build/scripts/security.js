"use strict";
const axios = require("axios").default;
const { pbkdf2Sync } = require("crypto");
const API_HOSTNAME = "127.0.0.1";
const API_PORT = 9000;
const SALT = "pib4nd0fF1v3";
function hash(password) {
    return pbkdf2Sync(password, SALT, 1000, 64, "sha512").toString("hex");
}
function register(user, callback) {
    axios
        .post(`http://${API_HOSTNAME}:${API_PORT}/register`, user)
        .then((response) => {
        callback(response.data);
    })
        .catch((error) => {
        console.log(error);
        callback("");
    });
}
function authenticate(user, callback) {
    axios
        .post(`http://${API_HOSTNAME}:${API_PORT}/authenticate`, user)
        .then((result) => {
        callback(result.data);
    })
        .catch((error) => {
        console.log(error);
        callback("");
    });
}
