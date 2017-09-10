import * as exCommands from 'ui/ex-commands';

jest.mock('fs-extra', () => ({
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve()),
}));

jest.mock('electron', () => {
  const close = jest.fn();
  return {
    remote: {
      close,
      getCurrentWindow: jest.fn(() => ({ close })),
    },
  };
});

jest.mock('./state/actions', () => ({
  destroyView: jest.fn(),
  createView: jest.fn(),
  updateConfig: jest.fn(),
  toggleTreeView: jest.fn(),
  userInputFocus: jest.fn(),
}));

describe('ex-commands', () => {
  const defaultState = {
    config: {
      isBrowserVisible: true,
      currentViewId: 1,
    },
    views: [{
      id: 1,
      filename: 'foo.txt',
      lines: ['hello!'],
    }],
    command: '',
  };

  describe('saveCurrentFile', () => {
    it('should save the current view', () => {
      const { writeFile } = require('fs-extra'); // eslint-disable-line global-require
      exCommands.saveCurrentFile({ state: defaultState, args: [] });

      expect(writeFile).toHaveBeenCalledWith('foo.txt', 'hello!\n');
    });

    it('should save the current view to a new file', () => {
      const { writeFile } = require('fs-extra'); // eslint-disable-line global-require
      exCommands.saveCurrentFile({ state: defaultState, args: ['new-foo.txt'] });

      expect(writeFile).toHaveBeenCalledWith('new-foo.txt', 'hello!\n');
    });
  });

  describe('exitCurrentFileOrApp', () => {
    it('should destroy the current view if there is one', () => {
      const { destroyView } = require('./state/actions'); // eslint-disable-line global-require
      const dispatch = jest.fn();
      exCommands.exitCurrentFileOrApp({ dispatch, state: defaultState });

      expect(destroyView).toHaveBeenCalledWith(1);
      expect(dispatch).toHaveBeenCalled();
    });

    it('should close the app if there is no view', () => {
      const { remote } = require('electron'); // eslint-disable-line global-require
      const { destroyView } = require('./state/actions'); // eslint-disable-line global-require
      const dispatch = jest.fn();
      exCommands.exitCurrentFileOrApp({
        dispatch,
        state: {
          ...defaultState,
          views: [],
        },
      });

      expect(destroyView).not.toHaveBeenCalledWith(0);
      expect(dispatch).not.toHaveBeenCalled();
      expect(remote.getCurrentWindow).toHaveBeenCalled();
      expect(remote.close).toHaveBeenCalled();
    });
  });

  describe('saveAndExit', () => {
    it('should save and then exit', () => {
      const { writeFile } = require('fs-extra'); // eslint-disable-line global-require
      const dispatch = jest.fn();
      return exCommands.saveAndExit({
        dispatch,
        args: [],
        state: defaultState,
      }).then(() => {
        // An approximation - it's hard to set up mocks for the internal use of
        // saveCurrentFile and exitCurrentFileOrApp inside saveAndExit.
        expect(writeFile).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalled();
      });
    });
  });

  describe('openFile', () => {
    it('should open the provided file', () => {
      const { readFile } = require('fs-extra'); // eslint-disable-line global-require
      const { createView } = require('./state/actions'); // eslint-disable-line global-require
      const dispatch = jest.fn();
      return exCommands.openFile({
        dispatch,
        args: ['myfile.txt'],
      }).then(() => {
        expect(readFile).toHaveBeenCalledWith('myfile.txt', { encoding: 'utf-8' });
        expect(createView).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalled();
      });
    });

    it('should also open new files', () => {
      const { readFile } = require('fs-extra'); // eslint-disable-line global-require
      const { createView } = require('./state/actions'); // eslint-disable-line global-require
      // Emulate an error being thrown by fs, the effect is the same.
      const dispatch = jest.fn(() => { throw new Error(); });
      return exCommands.openFile({
        dispatch,
        args: ['myfile.txt'],
      }).catch(() => {
        expect(readFile).toHaveBeenCalledWith('myfile.txt', { encoding: 'utf-8' });
        expect(createView).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalled();
      });
    });

    it('should open a new unnamed file if no filename is provided', () => {
      const { createView } = require('./state/actions'); // eslint-disable-line global-require
      const dispatch = jest.fn();
      return exCommands.openFile({
        dispatch,
        args: [''],
      }).then(() => {
        expect(createView).toHaveBeenCalledWith('unnamed', '');
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
      const { updateConfig } = require('./state/actions'); // eslint-disable-line global-require
      const dispatch = jest.fn();
      exCommands.changeDirectory({ args: ['.'], dispatch });

      expect(dispatch).toHaveBeenCalled();
      expect(updateConfig).toHaveBeenCalled();
    });
  });

  describe('toggleBrowser', () => {
    it('should dispatch an action to toggle the browser visibility', () => {
      const { updateConfig } = require('./state/actions'); // eslint-disable-line global-require
      const dispatch = jest.fn();
      exCommands.toggleBrowser({ state: defaultState, dispatch });
      expect(dispatch).toHaveBeenCalled();
      expect(updateConfig).toHaveBeenCalledWith({ isBrowserVisible: false });
    });

    it('should also dispatch an action to remove user focus when showing the browser', () => {
      const { updateConfig, userInputFocus } = require('./state/actions'); // eslint-disable-line global-require
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
    it('should dispatch an action to toggle the tree view visibility', () => {
      const { toggleTreeView } = require('./state/actions'); // eslint-disable-line global-require
      const dispatch = jest.fn();
      exCommands.toggleTreeView({ dispatch });

      expect(dispatch).toHaveBeenCalled();
      expect(toggleTreeView).toHaveBeenCalled();
    });
  });
});
