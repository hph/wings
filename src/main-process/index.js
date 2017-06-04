import url from 'url';
import path from 'path';
import { app, BrowserWindow } from 'electron';

let mainWindow;
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));
}

app.on('ready', createWindow);
app.on('window-all-closed', app.quit);
