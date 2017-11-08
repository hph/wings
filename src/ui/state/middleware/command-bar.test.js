import commandBar from './command-bar';
import * as types from '../types';

jest.mock('../../ex-commands', () => ({
  saveAndExit: jest.fn(),
}));

describe('command bar middleware', () => {
  const defaultState = {
    config: {
      isBrowserVisible: true,
      currentPaneId: 1,
      commands: {
        x: 'saveAndExit',
      },
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
  const createMiddleware = (state = defaultState, value = 'Enter') => {
    const getState = jest.fn(() => state);
    const dispatch = jest.fn();
    const next = jest.fn();
    const middleware = commandBar({ getState, dispatch })(next);
    const action = {
      type: types.UPDATE_COMMAND,
      value,
    };
    return { getState, dispatch, next, middleware, action };
  };

  it('should execute the next middleware if the type does not match', () => {
    const { getState, middleware, next } = createMiddleware();
    const invalidActions = [
      {
        type: 'NOT_UPDATE_COMMAND',
      },
      {
        type: types.UPDATE_COMMAND,
        value: 'not Enter',
      },
    ];
    invalidActions.forEach(invalidAction => {
      middleware(invalidAction);
      expect(getState).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(invalidAction);
    });
  });

  it('should execute the next middleware if no handler is found', () => {
    const { action, dispatch, middleware, next } = createMiddleware(
      {
        ...defaultState,
        command: 'not-a-command',
      },
      'Enter',
    );
    middleware(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should delegate to the handler if one is found', () => {
    const { saveAndExit } = require('../../ex-commands'); // eslint-disable-line global-require

    const { action, dispatch, middleware, next } = createMiddleware(
      {
        ...defaultState,
        command: 'x',
      },
      'Enter',
    );
    middleware(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(saveAndExit).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_CONFIG,
      mode: 'normal',
    });
  });
});
