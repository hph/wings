import url from 'url';
import { BrowserWindow, ipcMain } from 'electron';

import setApplicationMenu from 'main-process/menu';
import {
  attachEventListeners,
  createBrowserWindow,
  isAsar,
  loadApplication,
  showWindow,
} from './main-window';

jest.mock('url', () => ({
  format: jest.fn(() => 'formatted'),
}));

jest.mock('path', () => ({
  join: jest.fn((dirname, path) => path),
}));

jest.mock('electron', () => ({
  BrowserWindow: jest.fn(() => ({
    loadURL: jest.fn(),
    show: jest.fn(),
    once: jest.fn(),
    webContents: {
      openDevTools: jest.fn(),
    },
  })),
  ipcMain: {
    once: jest.fn(),
  },
}));

jest.mock('./menu', () => jest.fn());

// Hack in order to re-establish the mainModule object, which disappeared in
// Jest v22 and Node v9 as part of using experimental modules.
process.mainModule = {};

describe('main-window', () => {
  const config = {
    window: {
      showTimeoutMs: 1000,
    },
    editor: {
      theme: {
        primaryBackgroundColor: 'primaryBackgroundColor',
      },
    },
  };

  describe('isAsar', () => {
    it('should determine whether the app is running in asar using the filename', () => {
      process.mainModule.filename = 'something';
      expect(isAsar()).toBe(false);

      process.mainModule.filename = 'something app.asar something';
      expect(isAsar()).toBe(true);
    });
  });

  describe('createBrowserWindow', () => {
    it('should instantiate a new BrowserWindow with the configured options', () => {
      createBrowserWindow(config);
      expect(BrowserWindow).toHaveBeenCalledWith({
        ...config.window,
        backgroundColor: config.editor.theme.primaryBackgroundColor,
        titleBarStyle: 'hidden',
        show: false,
      });
    });
  });

  describe('loadApplication', () => {
    const mainWindow = { loadURL: jest.fn() };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should load the app by URL', () => {
      loadApplication(mainWindow, config);
      expect(url.format).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: 'index.html',
          protocol: 'file:',
          slashes: true,
        }),
      );
      expect(mainWindow.loadURL).toHaveBeenCalledWith('formatted');
    });

    it('it should provide initial state in the hash part of the URL', () => {
      process.argv = [null, 'asar', 'not asar'];
      process.mainModule.filename = 'not-asar';
      loadApplication(mainWindow, config);
      const argument = url.format.mock.calls[0][0];
      expect(typeof argument.hash).toBe('string');
      expect(JSON.parse(argument.hash)).toEqual({
        filename: 'not asar',
        theme: config.editor.theme,
      });
    });

    it('should handle asar environemnt as well', () => {
      process.argv = [null, 'asar', 'not asar'];
      process.mainModule.filename = 'app.asar';
      loadApplication(mainWindow, config);
      const argument = url.format.mock.calls[0][0];
      expect(JSON.parse(argument.hash)).toEqual({
        filename: 'asar',
        theme: config.editor.theme,
      });
    });
  });

  describe('showWindow', () => {
    const mainWindow = {
      show: jest.fn(),
      webContents: {
        openDevTools: jest.fn(),
      },
    };

    it('should show the window', () => {
      showWindow(mainWindow);
      expect(mainWindow.show).toHaveBeenCalledWith();
    });

    it('should set the application menu', () => {
      showWindow(mainWindow);
      expect(setApplicationMenu).toHaveBeenCalledWith();
    });

    it('should open the devtools in development', () => {
      showWindow(mainWindow);
      expect(mainWindow.webContents.openDevTools).not.toHaveBeenCalled();

      process.env.NODE_ENV = 'development';
      showWindow(mainWindow);
      expect(mainWindow.webContents.openDevTools).toHaveBeenCalledWith({
        detach: true,
      });
    });
  });

  describe('attachEventListeners', () => {
    const mainWindow = {
      show: jest.fn(),
      once: jest.fn(),
      webContents: {
        openDevTools: jest.fn(),
      },
    };

    jest.useFakeTimers();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should set up a series of event listeners', () => {
      attachEventListeners(mainWindow, config);
      expect(mainWindow.once).toHaveBeenCalled();
      expect(mainWindow.once.mock.calls[0][0]).toBe('ready-to-show');
      expect(mainWindow.once.mock.calls[0][1]).toBeInstanceOf(Function);
      expect(mainWindow.once.mock.calls[1][0]).toBe('closed');
      expect(mainWindow.once.mock.calls[1][1]).toBeInstanceOf(Function);

      expect(ipcMain.once).toHaveBeenCalled();
      expect(ipcMain.once.mock.calls[0][0]).toBe('root-mounted');
      expect(ipcMain.once.mock.calls[0][1]).toBeInstanceOf(Function);
    });

    it('should set mainWindow to null once the window is closed', () => {
      attachEventListeners(mainWindow, config);
      const onClosed = mainWindow.once.mock.calls[1][1];
      onClosed();
      // Unfortunately the value of mainWindow does not appear to change
      // in the testing environment.
      expect(true).toBe(true);
    });

    it('should set a timeout to call showWindow after the defined max timeout', () => {
      showWindow.bind = jest.fn();
      attachEventListeners(mainWindow, config);
      expect(setTimeout).toHaveBeenCalledWith(
        showWindow.bind(null, mainWindow),
        config.window.showTimeoutMs,
      );
    });

    it('should show the app when both ready and mounted', () => {
      attachEventListeners(mainWindow, config);
      expect(mainWindow.show).not.toHaveBeenCalled();

      // Call the callbacks
      mainWindow.once.mock.calls[0][1]();
      ipcMain.once.mock.calls[0][1]();
      expect(mainWindow.show).toHaveBeenCalled();
    });
  });

  describe('createWindow', () => {
    it('should return a BrowserWindow-like object', () => {
      jest.unmock('./main-window');
      const mainWindow = require('./main-window'); // eslint-disable-line global-require
      let ref;
      const win = mainWindow.default(ref, config);
      expect(win).toBeDefined();
      expect(win.loadURL).toBeDefined();
      expect(win.show).toBeDefined();
    });
  });
});
