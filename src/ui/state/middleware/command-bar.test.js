import exCommands from './command-bar';
import * as types from '../types';

jest.mock('../actions', () => ({
  destroyView: jest.fn(),
  toggleTreeView: jest.fn(),
  updateConfig: jest.fn(),
  userInputFocus: jest.fn(),
}));

describe('command bar middleware', () => {
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
  const createMiddleware = (state = defaultState, value = 'Enter') => {
    const getState = () => state;
    const dispatch = jest.fn();
    const next = jest.fn();
    const middleware = exCommands({ getState, dispatch })(next);
    const action = {
      type: types.UPDATE_COMMAND,
      value,
    };
    return { getState, next, middleware, action };
  };

  it('should execute the next middleware if the type does not match', () => {
    const { middleware, next } = createMiddleware();
    const invalidActions = [{
      type: 'NOT_UPDATE_COMMAND',
    }, {
      type: types.UPDATE_COMMAND,
      value: 'not Enter',
    }];
    invalidActions.forEach(invalidAction => {
      middleware(invalidAction);
      expect(next).toHaveBeenCalledWith(invalidAction);
    });
  });

  it('should close the pane with q', () => {
    const { destroyView } = require('../actions'); // eslint-disable-line global-require
    const { middleware, action } = createMiddleware({
      ...defaultState,
      command: 'q',
    });
    middleware(action);

    expect(destroyView).toHaveBeenCalledWith(1);
  });

  it('should toggle tree view with t', () => {
    const { toggleTreeView } = require('../actions'); // eslint-disable-line global-require
    const { middleware, action } = createMiddleware({
      ...defaultState,
      command: 't',
    });
    middleware(action);

    expect(toggleTreeView).toHaveBeenCalled();
  });

  it('should toggle the browser visibility with b', () => {
    const { updateConfig, userInputFocus } = require('../actions'); // eslint-disable-line global-require
    const { middleware, action } = createMiddleware({
      ...defaultState,
      command: 'b',
    });
    middleware(action);

    expect(updateConfig).toHaveBeenCalledWith({ isBrowserVisible: false });
    expect(userInputFocus).not.toHaveBeenCalledWith(false);
  });

  it('remove user input focus when showing the browser', () => {
    const { updateConfig, userInputFocus } = require('../actions'); // eslint-disable-line global-require
    const { middleware, action } = createMiddleware({
      ...defaultState,
      config: {
        ...defaultState.config,
        isBrowserVisible: false,
      },
      command: 'b',
    });
    middleware(action);

    expect(updateConfig).toHaveBeenCalledWith({ isBrowserVisible: true });
    expect(userInputFocus).toHaveBeenCalledWith(false);
  });
});
