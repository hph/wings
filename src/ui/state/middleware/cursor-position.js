import _ from 'lodash';

import { currentView } from 'ui/state/selectors';
import * as types from 'ui/state/types';

export default function cursorPositionMiddleware ({ getState }) {
  return next => action => {
    if (action.type !== types.UPDATE_VIEW) {
      return next(action);
    }

    const state = getState();
    const { config } = state;
    const view = currentView(state);
    if (!view) {
      return next(action);
    }

    if (view.id !== action.id) {
      return next(action);
    }

    if (view.column === action.column && view.row === action.row) {
      return next(action);
    }

    const actionCopy = { ...action };

    const height = config.isTitleBarVisible
      ? view.height - parseInt(config.theme.titleBarHeight, 10)
      : view.height;
    const numLines = _.floor(height / config.charHeight) - 1;
    const lastVisibleRow = view.firstVisibleRow + numLines;
    if (action.row < view.firstVisibleRow) {
      actionCopy.firstVisibleRow = action.row;
    } else if (action.row > lastVisibleRow) {
      actionCopy.firstVisibleRow = view.firstVisibleRow + action.row - lastVisibleRow;
    }

    const numChars = _.floor(view.width / config.charWidth) - 1;
    const lastVisibleColumn = view.firstVisibleColumn + numChars;
    if (action.column < view.firstVisibleColumn) {
      actionCopy.firstVisibleColumn = action.column;
    } else if (action.column > lastVisibleColumn) {
      actionCopy.firstVisibleColumn = view.firstVisibleColumn + action.column - lastVisibleColumn;
    }

    return next(actionCopy);
  };
}
