import _ from 'lodash';
import { combineReducers } from 'redux';

import fixedKeys from 'ui/fixed-keys';
import * as types from 'ui/state/types';

const defaults = {
  config: {},
  views: [],
  command: '',
};

export function configReducer (state = defaults.config, action) {
  const { type, ...values } = action;
  switch (type) {
    case types.UPDATE_CONFIG: {
      return {
        ...state,
        ...values,
      };
    }

    case types.TOGGLE_TREE_VIEW: {
      return {
        ...state,
        isTreeViewVisible: !state.isTreeViewVisible,
      };
    }

    default: return state;
  }
}

export function viewsReducer (state = defaults.views, action) {
  const { type, ...values } = action;
  switch (type) {
    case types.CREATE_VIEW: {
      const lines = (action.text || '').split('\n').slice(0, -1);
      return [...state, _.defaults({ ..._.omit(values, 'text') }, {
        lines: _.isEmpty(lines) ? [''] : lines,
        column: 0,
        row: 0,
        firstVisibleRow: 0,
        firstVisibleColumn: 0,
        width: window.screen.width,
        height: window.screen.height,
      })];
    }

    case types.UPDATE_VIEW: {
      return _.map(state, (view) => {
        if (view.id === action.id) {
          return _.defaults({ ...values }, view);
        }
        return view;
      });
    }

    case types.DESTROY_VIEW: {
      return _.reject(state, ({ id }) => id === values.id);
    }

    default: return state;
  }
}

export function commandReducer (state = defaults.command, action) {
  const { type, value } = action;
  switch (type) {
    case types.UPDATE_COMMAND: {
      if (fixedKeys.has(value)) {
        if (value === 'Space') {
          return `${ state } `;
        } else if (value === 'Backspace') {
          return state.substring(0, state.length - 1);
        } else if (value === 'Enter') {
          return '';
        }
        return state;
      }
      return state + value;
    }

    default: return state;
  }
}

export default combineReducers({
  config: configReducer,
  views: viewsReducer,
  command: commandReducer,
});
