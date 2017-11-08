import { types } from 'ui/state';

let nextPaneId = 0;
export function createPane(filename, text) {
  nextPaneId += 1;
  return {
    type: types.CREATE_PANE,
    id: nextPaneId,
    filename,
    text,
  };
}

export function updatePane(id, options) {
  return {
    type: types.UPDATE_PANE,
    id,
    ...options,
  };
}

export function destroyPane(id) {
  return {
    type: types.DESTROY_PANE,
    id,
  };
}

export function updateConfig(options) {
  return {
    type: types.UPDATE_CONFIG,
    ...options,
  };
}

export function updateCommand(options) {
  return {
    type: types.UPDATE_COMMAND,
    ...options,
  };
}

export function execCommand(options) {
  return {
    type: types.EXEC_COMMAND,
    ...options,
  };
}

export function toggleTreeView() {
  return {
    type: types.TOGGLE_TREE_VIEW,
  };
}

export function userInputFocus(focus) {
  return {
    type: focus ? types.USER_INPUT_FOCUS : types.USER_INPUT_UNFOCUS,
  };
}
