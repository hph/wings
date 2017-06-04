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
