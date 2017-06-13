import _ from 'lodash';
import url from 'url';
import path from 'path';
import { BrowserWindow, app, ipcMain } from 'electron';

import getConfig from 'main-process/config';

function createWindow (mainWindow, config) {
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
      config: config.editor,
      filename: process.argv[2],
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
  // or after 1 second, whichever comes first.
  mainWindow.once('ready-to-show', maybeShow);
  ipcMain.once('root-mounted', maybeShow);
  setTimeout(show, 1000);

  mainWindow.once('closed', () => {
    mainWindow = null; // eslint-disable-line no-param-reassign
  });
}

getConfig().then((config) => {
  let mainWindow;
  if (app.isReady()) {
    createWindow(mainWindow, config);
  } else {
    app.once('ready', createWindow.bind(null, mainWindow, config));
  }
  app.once('window-all-closed', app.quit);
});
