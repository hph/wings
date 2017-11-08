import _ from 'lodash';

import { charSizes, currentPane } from 'ui/state/selectors';
import * as types from 'ui/state/types';

export default function cursorPositionMiddleware({ getState }) {
  return next => action => {
    if (action.type !== types.UPDATE_PANE) {
      return next(action);
    }

    const state = getState();
    const { config } = state;
    const pane = currentPane(state);
    if (!pane) {
      return next(action);
    }

    if (pane.id !== action.id) {
      return next(action);
    }

    if (pane.column === action.column && pane.row === action.row) {
      return next(action);
    }

    const actionCopy = { ...action };

    const height = config.isTitleBarVisible
      ? pane.height - parseInt(config.theme.titleBarHeight, 10)
      : pane.height;
    const { charHeight, charWidth } = charSizes(state);
    const numLines = _.floor(height / charHeight) - 1;
    const lastVisibleRow = pane.firstVisibleRow + numLines;
    if (action.row < pane.firstVisibleRow) {
      actionCopy.firstVisibleRow = action.row;
    } else if (action.row > lastVisibleRow) {
      actionCopy.firstVisibleRow =
        pane.firstVisibleRow + action.row - lastVisibleRow;
    }

    const numChars = _.floor(pane.width / charWidth) - 1;
    const lastVisibleColumn = pane.firstVisibleColumn + numChars;
    if (action.column < pane.firstVisibleColumn) {
      actionCopy.firstVisibleColumn = action.column;
    } else if (action.column > lastVisibleColumn) {
      actionCopy.firstVisibleColumn =
        pane.firstVisibleColumn + action.column - lastVisibleColumn;
    }

    return next(actionCopy);
  };
}
