import handleUserInput from './handle-user-input';
import * as types from '../types';

describe('handleUserInput', () => {
  const defaultState = {
    config: {
      mode: 'normal',
      keys: {
        normal: {
          i: 'enterInsertMode',
          A: ['enterInsertMode', 'moveAfterEnd'],
          I: ['enterInsertMode', 'moveToFirstNonWhitespace'],
        },
        ex: {},
        insert: {
          Escape: 'exitMode',
        },
      },
      currentPaneId: 1,
    },
    panes: [{
      id: 1,
      column: 10,
      row: 0,
      lines: [
        'hello, world!',
        'all good?',
      ],
    }],
  };

  const callFunction = (action = {}, state = defaultState) => {
    const getState = () => state;
    const dispatch = jest.fn();
    handleUserInput({ action, getState, dispatch });
    return { action, dispatch };
  };

  it('dispatches an update after executing a handler if there is one', () => {
    const { dispatch } = callFunction({ value: 'i' });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_CONFIG,
      mode: 'insert',
    });
  });

  it('updates the pane with entered characters and specifies that the user started typing', () => {
    const { dispatch } = callFunction({ value: 'a' }, {
      ...defaultState,
      config: {
        ...defaultState.config,
        mode: 'insert',
      },
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_PANE,
      column: 11,
      id: 1,
      lines: ['hello, worald!', 'all good?'],
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_CONFIG,
      isUserTyping: true,
    });
  });

  it('updates the config to specify that the user has stopped typing', () => {
    jest.useFakeTimers();
    const { dispatch } = callFunction({ value: 'a' }, {
      ...defaultState,
      config: {
        ...defaultState.config,
        mode: 'insert',
        isUserTyping: true,
      },
    });
    jest.runAllTimers();

    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_CONFIG,
      isUserTyping: false,
    });
  });

  it('replaces the previous character if required', () => {
    const { dispatch } = callFunction({ value: 'á', replacePrevious: true }, {
      ...defaultState,
      config: {
        ...defaultState.config,
        mode: 'insert',
      },
      panes: [{
        id: 1,
        lines: ['´'],
        row: 0,
        column: 1,
      }],
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_PANE,
      id: 1,
      lines: ['á'],
    });
  });

  it('should update the column in the pane when switching from insert to normal mode', () => {
    const { dispatch } = callFunction({ value: 'Escape' }, {
      ...defaultState,
      config: {
        ...defaultState.config,
        mode: 'insert',
      },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_PANE,
      id: 1,
      column: 9,
    });
  });

  it('executes pane commands with the provided payload', () => {
    const { dispatch } = callFunction({ value: 'A' });

    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_PANE,
      id: 1,
      column: 13,
      prevMaxColumn: 0,
    });
  });

  it('executes multiple commands as defined by the keys', () => {
    const { dispatch } = callFunction({ value: 'I' });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_CONFIG,
      mode: 'insert',
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_PANE,
      id: 1,
      column: 0,
      prevMaxColumn: 0,
    });
  });

  it('updates the ex command in ex mode', () => {
    const { dispatch } = callFunction({ value: 'val' }, {
      ...defaultState,
      config: {
        ...defaultState.config,
        mode: 'ex',
      },
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_COMMAND,
      value: 'val',
    });
  });

  it('does not dispatch an action if no handler is found (invalid operation)', () => {
    const { dispatch } = callFunction();

    expect(dispatch).not.toHaveBeenCalled();
  });
});
