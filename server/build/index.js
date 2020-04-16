"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const security_1 = require("./security");
const app = express();
const PORT = 9000;
app.use(express.json()); // for parsing application/json
app.post("/register", (request, response) => {
    const user = request.body;
    security_1.register(user, (user) => response.send(user));
});
app.post("/authenticate", (request, response) => {
    const user = request.body;
    security_1.authenticate(user, (user) => response.send(user));
});
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}...`);
});
