import _ from 'lodash';
import url from 'url';
import path from 'path';
import { BrowserWindow, ipcMain } from 'electron';

const isAsar = process.mainModule.filename.indexOf('app.asar') > -1;

export default function createWindow (mainWindow, config) {
  mainWindow = new BrowserWindow({ // eslint-disable-line no-param-reassign
    ...config.window,
    backgroundColor: config.editor.theme.primaryBackgroundColor,
    titleBarStyle: 'hidden',
    show: false,
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
    hash: JSON.stringify({
      ...config.editor,
      filename: process.argv[isAsar ? 1 : 2],
    }),
  }));

  const show = _.once(() => {
    mainWindow.show();
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ detach: true });
    }
  });

  let readyCount = 0;
  const maybeShow = () => {
    readyCount += 1;
    if (readyCount >= 2) {
      show();
    }
  };

  // Show the app once the window is ready and the app has been mounted
  // or after the configured timeout, whichever comes first.
  mainWindow.once('ready-to-show', maybeShow);
  ipcMain.once('root-mounted', maybeShow);
  setTimeout(show, config.window.showTimeoutMs);

  mainWindow.once('closed', () => {
    mainWindow = null; // eslint-disable-line no-param-reassign
  });
}
