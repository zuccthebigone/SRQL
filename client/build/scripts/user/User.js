"use strict";
class User {
    constructor(username = "", passwordHash = "", fullname = "", id = "") {
        this.username = username;
        this.passwordHash = passwordHash;
        this.fullname = fullname;
        this.id = id;
    }
}
