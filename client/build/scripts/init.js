"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function createWindow() {
    // Create the browser window.
    let win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    // and load the index.html of the app.
    win.loadFile("./build/index.html");
}
electron_1.app.whenReady().then(createWindow);
