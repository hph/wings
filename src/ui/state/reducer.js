import _ from 'lodash';
import { combineReducers } from 'redux';

import * as types from 'ui/state/types';

const defaults = {
  config: {
    mode: 'normal',
    cursorWidth: 0,
    cursorHeight: 0,
  },
  views: [],
};

function configReducer (state = defaults.config, action) {
  const { type, ...values } = action;
  switch (type) {
    case types.UPDATE_CONFIG: {
      return {
        ...state,
        ...values,
      };
    }

    default: return state;
  }
}
function viewsReducer (state = defaults.views, action) {
  const { type, ...values } = action;
  switch (type) {
    case types.CREATE_VIEW: {
      const lines = (action.text || '').split('\n').slice(0, -1);
      return [...state, _.defaults({ ..._.omit(values, 'text') }, {
        lines: _.isEmpty(lines) ? [''] : lines,
        column: 0,
        row: 0,
      })];
    }

    default: return state;
  }
}

export default combineReducers({
  config: configReducer,
  views: viewsReducer,
});
