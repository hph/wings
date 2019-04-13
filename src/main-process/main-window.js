import url from 'url';
import path from 'path';
import { BrowserWindow, ipcMain } from 'electron';

import setApplicationMenu from 'main-process/menu';

export const isAsar = () =>
  process.mainModule.filename.indexOf('app.asar') > -1;

export const createBrowserWindow = config => {
  return new BrowserWindow({
    ...config.window,
    webPreferences: {
      nodeIntegration: true,
    },
    backgroundColor: config.editor.theme.primaryBackgroundColor,
    titleBarStyle: 'hidden',
    show: false,
  });
};

export const loadApplication = (mainWindow, config) => {
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
      hash: JSON.stringify({
        ...config.editor,
        filename: process.argv[isAsar() ? 1 : 2],
      }),
    }),
  );
};

export const showWindow = mainWindow => {
  mainWindow.show();
  setApplicationMenu();
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
};

export const attachEventListeners = (mainWindow, config) => {
  let readyCount = 0;
  const maybeShow = () => {
    readyCount += 1;
    if (readyCount >= 2) {
      showWindow(mainWindow);
    }
  };

  // Show the app once the window is ready and the app has been mounted
  // or after the configured timeout, whichever comes first.
  mainWindow.once('ready-to-show', maybeShow);
  ipcMain.once('root-mounted', maybeShow);
  setTimeout(showWindow.bind(null, mainWindow), config.window.showTimeoutMs);

  mainWindow.once('closed', () => {
    mainWindow = null; // eslint-disable-line no-param-reassign
  });
};

export default function createWindow(mainWindow, config) {
  mainWindow = createBrowserWindow(config); // eslint-disable-line no-param-reassign
  loadApplication(mainWindow, config);
  attachEventListeners(mainWindow, config);
  return mainWindow;
}
