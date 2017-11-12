import { app } from 'electron';

import getConfig from 'main-process/config';
import createWindow from 'main-process/main-window';

import main from './index';

jest.mock('electron', () => ({
  app: {
    isReady: jest.fn(),
    once: jest.fn(),
    quit: jest.fn(),
  },
}));

jest.mock('main-process/config', () =>
  jest.fn(() => Promise.resolve('config')),
);
jest.mock('main-process/main-window', () => jest.fn());

describe('main-process entry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call createWindow if ready', () => {
    app.isReady.mockImplementation(() => false);
    return main()
      .then(() => {
        expect(createWindow).not.toHaveBeenCalled();
      })
      .then(() => {
        app.isReady.mockImplementation(() => true);
        return main();
      })
      .then(() => {
        expect(createWindow).toHaveBeenCalledWith(undefined, 'config');
      });
  });

  it('should add a ready event listener to call createWindow if not ready', () => {
    app.isReady.mockImplementation(() => true);
    return main()
      .then(() => {
        expect(app.once.mock.calls.length).toBe(1);
        expect(app.once.mock.calls[0][0]).not.toBe('ready');
      })
      .then(() => {
        app.isReady.mockImplementation(() => false);
        app.once.mockReset();
        createWindow.bind = jest.fn();
        return main();
      })
      .then(() => {
        expect(app.once.mock.calls[0][0]).toBe('ready');
        expect(createWindow.bind).toHaveBeenCalledWith(
          null,
          undefined,
          'config',
        );
      });
  });

  it('should always set an event listener for window-all-closed to quit', () => {
    app.isReady.mockImplementation(() => false);
    return main()
      .then(() => {
        expect(app.once).toHaveBeenCalledWith('window-all-closed', app.quit);
      })
      .then(() => {
        app.isReady.mockImplementation(() => true);
        app.once.mockReset();
        return main();
      })
      .then(() => {
        expect(app.once).toHaveBeenCalledWith('window-all-closed', app.quit);
      });
  });

  it('should log any unexpected errors and exit the process', () => {
    const error = 'something bad happened';
    global.process.exit = jest.fn();
    console.log = jest.fn(); // eslint-disable-line no-console
    getConfig.mockImplementation(() => Promise.reject(error));
    return main().catch(caughtError => {
      expect(caughtError).toEqual(error);
      expect(global.process.exit).toHaveBeenCalledWith(1);
    });
  });
});
