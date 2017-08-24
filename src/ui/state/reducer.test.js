import { configReducer, viewsReducer, commandReducer } from './reducer';
import * as types from './types';

describe('configReducer', () => {
  describe('UPDATE_CONFIG', () => {
    it('should merge the current state with the provided values', () => {
      const original = { hello: 'world' };
      const newItems = {
        newItem: true,
        anotherItem: 'yep',
      };
      const action = {
        type: types.UPDATE_CONFIG,
        ...newItems,
      };

      expect(configReducer(original, action)).toEqual({
        ...original,
        ...newItems,
      });
    });
  });

  describe('TOGGLE_TREE_VIEW', () => {
    it('should toggle the boolean value of isTreeViewVisible', () => {
      const action = { type: types.TOGGLE_TREE_VIEW };

      expect(configReducer({
        isTreeViewVisible: false,
      }, action)).toEqual({ isTreeViewVisible: true });

      expect(configReducer({
        isTreeViewVisible: true,
      }, action)).toEqual({ isTreeViewVisible: false });
    });
  });
});

describe('viewsReducer', () => {
  describe('CREATE_VIEW', () => {
    it('should set the default values and split the text into lines', () => {
      const action = {
        type: types.CREATE_VIEW,
        filename: 'file.txt',
        text: 'hello\nworld!\n',
      };

      expect(viewsReducer([], action)[0]).toEqual({
        column: 0,
        row: 0,
        firstVisibleColumn: 0,
        firstVisibleRow: 0,
        width: 0,
        height: 0,
        filename: action.filename,
        lines: [
          'hello',
          'world!',
        ],
      });
    });
  });

  describe('UPDATE_VIEW', () => {
    const state = [
      { id: 1 },
      { id: 2 },
    ];
    const newValues = {
      key: 'value',
      another: 'value',
    };
    const action = {
      type: types.UPDATE_VIEW,
      id: 1,
      ...newValues,
    };

    expect(viewsReducer(state, action)).toEqual([
      { id: 1, ...newValues },
      { id: 2 },
    ]);
  });

  describe('DESTROY_VIEW', () => {
    const state = [
      { id: 1 },
      { id: 2 },
    ];

    expect(viewsReducer(state, { type: types.DESTROY_VIEW, id: 2 })).toEqual([
      { id: 1 },
    ]);
  });
});

describe('commandReducer', () => {
  describe('UPDATE_COMMAND', () => {
    it('should simply update the command if the value is not a fixed key', () => {
      const action = {
        type: types.UPDATE_COMMAND,
        value: 'a',
      };

      expect(commandReducer('', action)).toEqual('a');
      expect(commandReducer('hello ', action)).toEqual('hello a');
    });

    it('should allow spaces', () => {
      const action = {
        type: types.UPDATE_COMMAND,
        value: 'Space',
      };

      expect(commandReducer('', action)).toEqual(' ');
      expect(commandReducer('hi', action)).toEqual('hi ');
    });

    it('should delete the previous character with Backspace', () => {
      const action = {
        type: types.UPDATE_COMMAND,
        value: 'Backspace',
      };

      expect(commandReducer('', action)).toEqual('');
      expect(commandReducer('hi', action)).toEqual('h');
    });

    it('should clear the value with Enter', () => {
      const action = {
        type: types.UPDATE_COMMAND,
        value: 'Enter',
      };

      expect(commandReducer('', action)).toEqual('');
      expect(commandReducer('hello', action)).toEqual('');
    });
  });
});
