import { remote } from 'electron';

import { readFile, writeFile } from 'lib/io';
import * as exCommands from 'ui/ex-commands';
import {
  createPane,
  destroyPane,
  toggleTreeView,
  updateConfig,
  userInputFocus,
} from './state/actions';

jest.mock('electron', () => {
  const close = jest.fn();
  const isFullScreen = jest.fn();
  const setFullScreen = jest.fn();
  return {
    remote: {
      close,
      getCurrentWindow: jest.fn(() => ({
        close,
        isFullScreen,
        setFullScreen,
      })),
    },
  };
});

jest.mock('lib/io', () => ({
  readFile: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn(() => Promise.resolve()),
}));

jest.mock('./state/actions', () => ({
  createPane: jest.fn(),
  destroyPane: jest.fn(),
  toggleTreeView: jest.fn(),
  updateConfig: jest.fn(),
  userInputFocus: jest.fn(),
}));

describe('ex-commands', () => {
  const defaultState = {
    config: {
      isBrowserVisible: true,
      currentPaneId: 1,
    },
    panes: [
      {
        id: 1,
        filename: 'foo.txt',
        lines: ['hello!'],
      },
    ],
    command: '',
  };

  describe('saveCurrentFile', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should save the current pane', () => {
      exCommands.saveCurrentFile({ state: defaultState, args: [] });

      expect(writeFile).toHaveBeenCalledWith('foo.txt', 'hello!\n');
    });

    it('should save the current pane to a new file', () => {
      exCommands.saveCurrentFile({
        state: defaultState,
        args: ['new-foo.txt'],
      });

      expect(writeFile).toHaveBeenCalledWith('new-foo.txt', 'hello!\n');
    });
  });

  describe('exitCurrentFileOrApp', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should destroy the current pane if there is one', () => {
      const dispatch = jest.fn();
      exCommands.exitCurrentFileOrApp({ dispatch, state: defaultState });

      expect(destroyPane).toHaveBeenCalledWith(1);
      expect(dispatch).toHaveBeenCalled();
    });

    it('should close the app if there is no pane', () => {
      const dispatch = jest.fn();
      exCommands.exitCurrentFileOrApp({
        dispatch,
        state: {
          ...defaultState,
          panes: [],
        },
      });

      expect(destroyPane).not.toHaveBeenCalledWith(0);
      expect(dispatch).not.toHaveBeenCalled();
      expect(remote.getCurrentWindow).toHaveBeenCalled();
      expect(remote.close).toHaveBeenCalled();
    });
  });

  describe('saveAndExit', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should save and then exit', () => {
      const dispatch = jest.fn();
      return exCommands
        .saveAndExit({
          dispatch,
          args: [],
          state: defaultState,
        })
        .then(() => {
          // An approximation - it's hard to set up mocks for the internal use of
          // saveCurrentFile and exitCurrentFileOrApp inside saveAndExit.
          expect(writeFile).toHaveBeenCalled();
          expect(dispatch).toHaveBeenCalled();
        });
    });
  });

  describe('openFile', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should open the provided file', () => {
      const dispatch = jest.fn();
      return exCommands
        .openFile({
          dispatch,
          args: ['myfile.txt'],
        })
        .then(() => {
          expect(readFile).toHaveBeenCalledWith('myfile.txt', {
            encoding: 'utf-8',
          });
          expect(createPane).toHaveBeenCalled();
          expect(dispatch).toHaveBeenCalled();
        });
    });

    it('should also open new files', () => {
      // Emulate an error being thrown by fs, the effect is the same.
      const dispatch = jest.fn(() => {
        throw new Error();
      });
      return exCommands
        .openFile({
          dispatch,
          args: ['myfile.txt'],
        })
        .catch(() => {
          expect(readFile).toHaveBeenCalledWith('myfile.txt', {
            encoding: 'utf-8',
          });
          expect(createPane).toHaveBeenCalled();
          expect(dispatch).toHaveBeenCalled();
        });
    });

    it('should open a new unnamed file if no filename is provided', () => {
      const dispatch = jest.fn();
      return exCommands
        .openFile({
          dispatch,
          args: [''],
        })
        .then(() => {
          expect(createPane).toHaveBeenCalledWith('unnamed', '');
          expect(dispatch).toHaveBeenCalled();
        });
    });
  });

  describe('changeDirectory', () => {
    it('should not do anything if the directory does not exist', () => {
      const dispatch = jest.fn();
      console.error = jest.fn(); // eslint-disable-line no-console
      exCommands.changeDirectory({ args: ['not-a-directory'], dispatch });

      expect(dispatch).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled(); // eslint-disable-line no-console
    });

    it('should change the directory if it exists', () => {
      const dispatch = jest.fn();
      exCommands.changeDirectory({ args: ['.'], dispatch });

      expect(dispatch).toHaveBeenCalled();
      expect(updateConfig).toHaveBeenCalled();
    });
  });

  describe('toggleBrowser', () => {
    it('should dispatch an action to toggle the browser visibility', () => {
      const dispatch = jest.fn();
      exCommands.toggleBrowser({ state: defaultState, dispatch });
      expect(dispatch).toHaveBeenCalled();
      expect(updateConfig).toHaveBeenCalledWith({ isBrowserVisible: false });
    });

    it('should also dispatch an action to remove user focus when showing the browser', () => {
      const dispatch = jest.fn();
      exCommands.toggleBrowser({
        dispatch,
        state: {
          defaultState,
          config: {
            isBrowserVisible: false,
          },
        },
      });
      expect(dispatch).toHaveBeenCalled();
      expect(updateConfig).toHaveBeenCalledWith({ isBrowserVisible: true });
      expect(userInputFocus).toHaveBeenCalledWith(false);
    });
  });

  describe('toggleTreeView', () => {
    it('should dispatch an action to toggle the treeview visibility', () => {
      const dispatch = jest.fn();
      exCommands.toggleTreeView({ dispatch });

      expect(dispatch).toHaveBeenCalled();
      expect(toggleTreeView).toHaveBeenCalled();
    });
  });

  describe('toggleFullScreen', () => {
    jest.useFakeTimers();

    it('should go into normal mode and toggle full screen state', () => {
      const dispatch = jest.fn();
      exCommands.toggleFullScreen({ dispatch });

      expect(dispatch).toHaveBeenCalled();
      expect(updateConfig).toHaveBeenCalledWith({ mode: 'normal' });

      jest.runAllTimers();

      expect(remote.getCurrentWindow).toHaveBeenCalled();

      const { setFullScreen } = remote.getCurrentWindow();
      expect(setFullScreen).toHaveBeenCalled();
    });
  });
});
