import * as actions from './actions';
import * as types from './types';

describe('createView', () => {
  const filename = 'file.txt';
  const text = 'hello, world!';

  it('should create a new view from the provided filename and text', () => {
    expect(actions.createView(filename, text)).toEqual({
      filename,
      text,
      id: 1,
      type: types.CREATE_VIEW,
    });
  });

  it('should generate a distinct id for each view created', () => {
    expect(actions.createView(filename, text)).toEqual({
      filename,
      text,
      id: 2,
      type: types.CREATE_VIEW,
    });
  });
});

describe('updateView', () => {
  it('should return the passed object items with the appropriate action type', () => {
    expect(actions.updateView(1, { filename: 'file.txt' })).toEqual({
      type: types.UPDATE_VIEW,
      id: 1,
      filename: 'file.txt',
    });
  });
});

describe('destroyView', () => {
  it('should return the provided id and the appropriate action type', () => {
    expect(actions.destroyView(1)).toEqual({
      type: types.DESTROY_VIEW,
      id: 1,
    });
  });
});

describe('updateConfig', () => {
  it('should return the passed object items with the appropriate action type', () => {
    const newConfig = {
      foo: 'bar',
      arbitrary: 'key-value pairs',
    };
    expect(actions.updateConfig(newConfig)).toEqual({
      type: types.UPDATE_CONFIG,
      ...newConfig,
    });
  });
});

describe('updateCommand', () => {
  it('should return the passed object items with the appropriate action type', () => {
    const newCommand = {
      foo: 'bar',
      arbitrary: 'key-value pairs',
    };
    expect(actions.updateCommand(newCommand)).toEqual({
      type: types.UPDATE_COMMAND,
      ...newCommand,
    });
  });
});

describe('execCommand', () => {
  it('should return the passed object items with the appropriate action type', () => {
    const newCommand = {
      foo: 'bar',
      arbitrary: 'key-value pairs',
    };
    expect(actions.execCommand(newCommand)).toEqual({
      type: types.EXEC_COMMAND,
      ...newCommand,
    });
  });
});

describe('toggleTreeView', () => {
  it('should return an object with the appropriate type', () => {
    expect(actions.toggleTreeView()).toEqual({
      type: types.TOGGLE_TREE_VIEW,
    });
  });
});

describe('userInputFocus', () => {
  it('should return an object with the focus type if focus is true', () => {
    expect(actions.userInputFocus(true)).toEqual({
      type: types.USER_INPUT_FOCUS,
    });
  });

  it('should return an object with the unfocus type if focus is false', () => {
    expect(actions.userInputFocus(false)).toEqual({
      type: types.USER_INPUT_UNFOCUS,
    });
  });
});
