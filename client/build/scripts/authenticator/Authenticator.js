"use strict";
class Authenticator extends Observer {
    constructor(client) {
        super(client);
    }
    update(user) {
        const isAuthenticated = user.id !== "";
        document
            .getElementById("txt-id")
            ?.setAttribute("placeholder", isAuthenticated ? user.id : "ID goes here");
        document
            .getElementById("txt-username")
            ?.setAttribute("placeholder", isAuthenticated ? user.username : "Username goes here");
        document
            .getElementById(isAuthenticated ? "vw-auth" : "vw-main")
            ?.setAttribute("hidden", "");
        document
            .getElementById(isAuthenticated ? "vw-main" : "vw-auth")
            ?.removeAttribute("hidden");
    }
}
