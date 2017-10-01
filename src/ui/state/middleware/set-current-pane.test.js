import setCurrentPane from './set-current-pane';
import * as types from '../types';

jest.mock('../actions', () => ({
  updateConfig: jest.fn(),
}));

describe('setCurrentPane', () => {
  const getState = () => ({ panes: [{ id: 10 }] });
  const dispatch = () => {};
  const middleware = setCurrentPane({ getState, dispatch });

  it('should handle a CREATE_PANE action by updating the config to set the current pane', done => {
    const { updateConfig } = require('../actions'); // eslint-disable-line global-require
    const action = { type: types.CREATE_PANE, id: 1 };
    const next = jest.fn();

    middleware(next)(action);

    setTimeout(() => {
      expect(updateConfig.mock.calls.length).toBe(1);
      expect(updateConfig.mock.calls[0][0]).toEqual({ currentPaneId: 1 });
      expect(next).toHaveBeenCalled();
      done();
    });
  });

  it('should handle a DESTROY_PANE action by updating the config to set another current pane', done => {
    const { updateConfig } = require('../actions'); // eslint-disable-line global-require
    const action = { type: types.DESTROY_PANE, id: 1 };
    const next = jest.fn();

    middleware(next)(action);

    setTimeout(() => {
      expect(updateConfig.mock.calls.length).toBe(2);
      expect(updateConfig.mock.calls[1][0]).toEqual({ currentPaneId: 10 });
      expect(next).toHaveBeenCalled();
      done();
    });
  });

  it('should handle any other actions by calling the next middleware', () => {
    const { updateConfig } = require('../actions'); // eslint-disable-line global-require
    const action = { type: 'SOME_OTHER_TYPE' };
    const next = jest.fn();

    middleware(next)(action);

    expect(updateConfig.mock.calls.length).toBe(2);
    expect(next).toHaveBeenCalled();
  });
});
