"use strict";
const inpUsername = document.getElementById("inp-username");
const inpPassword = document.getElementById("inp-password");
const inpFullname = document.getElementById("inp-fullname");
const btnRegister = document.getElementById("btn-register");
const btnAuthenticate = (document.getElementById("btn-authenticate"));
const btnLogout = document.getElementById("btn-logout");
let client = new Client(new User());
let authenticator = new Authenticator(client);
btnRegister.addEventListener("click", () => {
    register(new User(inpUsername.value, hash(inpPassword.value), inpFullname.value), (user) => (client.state = user));
});
btnAuthenticate.addEventListener("click", () => {
    authenticate(new User(inpUsername.value, hash(inpPassword.value)), (user) => {
        client.state = user;
    });
});
btnLogout.addEventListener("click", () => {
    client.state = new User();
});
