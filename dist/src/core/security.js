"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const username = "zuccthebigone";
const password = "password123";
const colours = [
    "804a6f",
    "4a7b80",
    "b86124",
    "c34691",
    "63a1a8",
    "2a2a2a",
    "7a3fba",
    "2c853b",
    "5b5b68",
    "4f4a80",
];
const salt = "piB4nd0fF1v3";
function hashPassword(password) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}
exports.hashPassword = hashPassword;
function authenticate(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const clientFactory = new ClientFactory();
        const client = yield clientFactory.new();
        const { rowCount, rows, } = yield client.query(`SELECT DISTINCT id, name FROM public.user WHERE username=$1::text AND password=$2::text`, [username, password]);
        if (rowCount === 0)
            return null;
        return rows[0];
    });
}
exports.authenticate = authenticate;
//# sourceMappingURL=security.js.map