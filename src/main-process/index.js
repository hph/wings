import _ from 'lodash';
import url from 'url';
import path from 'path';
import { BrowserWindow, app, ipcMain } from 'electron';

import getConfig from 'main-process/config';

function createWindow (mainWindow, config) {
  mainWindow = new BrowserWindow({ // eslint-disable-line no-param-reassign
    ...config.window,
    backgroundColor: config.editor.theme.primaryBackgroundColor,
    show: false,
  });

  ipcMain.on('request-init', () => {
    mainWindow.webContents.send('init', {
      filename: process.argv[2],
      config: _.omit(config, 'window'),
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null; // eslint-disable-line no-param-reassign
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  // Ensure that the app is opened even if there's an error.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.show();
    mainWindow.webContents.openDevTools({ detach: true });
  } else {
    // "root-mounted" may not be fired at all, for instance if there's an
    // error. This case needs to be handled.
    ipcMain.on('root-mounted', mainWindow.show);
  }
}

getConfig().then((config) => {
  let mainWindow;

  if (app.isReady()) {
    createWindow(mainWindow, config);
  } else {
    app.on('ready', createWindow.bind(null, mainWindow, config));
  }

  app.on('window-all-closed', app.quit);
});
