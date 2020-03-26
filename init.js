const {app, BrowserWindow} = require("electron");

function create_window() {
  let win = new BrowserWindow({
    width: 1060,
    height: 550,
    minWidth: 724,
    minHeight: 330,
    backgroundColor: "#fff",
    icon: "assets/images/logo.png",
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile("src/index.html");

  win.once("ready-to-show", () => {
    win.show();
  });
}

app.on("ready", create_window);
