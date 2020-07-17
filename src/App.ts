import { app, BrowserWindow, ipcMain } from 'electron';

class App extends BrowserWindow {
  constructor() {
    super({
      width: 1060,
      height: 550,
      minWidth: 724,
      minHeight: 330,
      backgroundColor: '#fff',
      icon: 'assets/images/logo.png',
      frame: false,
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    });


    ipcMain.handle('close', () => this.close());
    ipcMain.handle('restore', () => {
      if (this.isMaximized()) {
        this.restore();
      } else {
        this.maximize();
      }
      return;
    });
    ipcMain.handle('minimise', () => this.minimize());
    ipcMain.handle('isMaximised', () => this.isMaximized());

    this.loadFile('../index.html');

    this.once('ready-to-show', () => this.show());
  }
}

app.whenReady().then(() => new App());
