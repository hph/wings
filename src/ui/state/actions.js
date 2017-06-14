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

export function updateConfig (options) {
  return {
    type: types.UPDATE_CONFIG,
    ...options,
  };
}
