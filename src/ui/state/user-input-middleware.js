import { updateView } from 'ui/state/actions';

export default function createUserInputMiddleware () {
  return ({ getState, dispatch }) => {
    const input = document.createElement('input');
    input.style.position = 'absolute';
    input.style.top = '0';
    input.style.left = '0';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.focus();

    // Automatically reinstate focus if lost (on external click events, etc).
    input.addEventListener('blur', input.focus);

    input.addEventListener('keydown', (event) => {
      event.preventDefault();
      const key = event.key.toLowerCase();
      const state = getState();
      const view = state.views[0];

      let payload;
      if (key === 'h' && view.column > 0) {
        payload = { column: view.column - 1 };
      } else if (key === 'j' && view.row < view.lines.length - 1) {
        payload = { row: view.row + 1 };
      } else if (key === 'k' && view.row > 0) {
        payload = { row: view.row - 1 };
      } else if (key === 'l' && view.column < view.lines[view.row].length - 1) {
        payload = { column: view.column + 1 };
      }
      if (payload) {
        dispatch(updateView(view.id, payload));
      }
    });

    return next => action => next(action);
  };
}
