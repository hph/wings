import _ from 'lodash';
import { combineReducers } from 'redux';

import * as types from 'ui/state/types';

const defaults = {
  config: {},
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

    default: return state;
  }
}

export default combineReducers({
  config: configReducer,
  views: viewsReducer,
});
