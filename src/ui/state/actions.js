import { types } from 'ui/state';

let nextViewId = 0;
export function createView (filename, text) {
  nextViewId += 1;
  return {
    type: types.CREATE_VIEW,
    id: nextViewId,
    filename,
    text,
  };
}

export function updateView (id, options) {
  return {
    type: types.UPDATE_VIEW,
    id,
    ...options,
  };
}

export function destroyView (id) {
  return {
    type: types.DESTROY_VIEW,
    id,
  };
}

export function updateConfig (options) {
  return {
    type: types.UPDATE_CONFIG,
    ...options,
  };
}

export function updateCommand (options) {
  return {
    type: types.UPDATE_COMMAND,
    ...options,
  };
}

export function execCommand (options) {
  return {
    type: types.EXEC_COMMAND,
    ...options,
  };
}

let isTreeViewVisible = false;
export function toggleTreeView () {
  isTreeViewVisible = !isTreeViewVisible;
  return {
    type: types.TOGGLE_TREE_VIEW,
    isTreeViewVisible,
  };
}

export function userInputFocus (focus) {
  return {
    type: focus ? types.USER_INPUT_FOCUS : types.USER_INPUT_UNFOCUS,
  };
}
