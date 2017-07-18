import handleUserInput from 'ui/state/middleware/handle-user-input';
import {
  USER_INPUT,
  USER_INPUT_FOCUS,
  USER_INPUT_UNFOCUS,
} from 'ui/state/types';

/**
 * Create an invisible input element outside the viewport and
 * append it to the body.
 */
function createElement () {
  const input = document.createElement('input');
  input.style.position = 'absolute';
  input.style.top = '-1000px';
  input.style.opacity = '0';
  document.body.appendChild(input);
  return input;
}

/**
 * This middleware concerns itself with setting up an invisible input field
 * to capture all user input and retain focus at all times, as well as dealing
 * with normal and composed key values ("´" + "a" = "á" is one such example).
 */
export default function userInputMiddleware ({ getState, dispatch }) {
  const input = createElement();
  input.focus();
  input.addEventListener('blur', input.focus);

  const defaults = {
    type: USER_INPUT,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    replacePrevious: false,
  };

  input.addEventListener('keydown', (event) => {
    if (event.metaKey && event.key === 'v') {
      return;
    }

    event.preventDefault();
    if (!event.isComposing && event.key !== 'Dead') {
      dispatch({
        ...defaults,
        value: event.key,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
      });
    }
  });

  input.addEventListener('paste', (event) => {
    dispatch({ ...defaults, value: event.clipboardData.getData('text') });
  });

  let composedValue = '';
  input.addEventListener('compositionupdate', ({ data }) => {
    if (composedValue === '') {
      composedValue = data;
      dispatch({ ...defaults, value: data });
    } else {
      if (composedValue !== data) {
        const [firstChar, secondChar] = data;
        if (firstChar !== composedValue) {
          dispatch({ ...defaults, value: firstChar, replacePrevious: true });
        } else if (secondChar) {
          dispatch({ ...defaults, value: secondChar });
        }
      }
      composedValue = '';
    }
  });

  return next => action => {
    if (action.type === USER_INPUT) {
      handleUserInput({ action, getState, dispatch });
    } else if (action.type === USER_INPUT_FOCUS) {
      input.focus();
      input.addEventListener('blur', input.focus);
    } else if (action.type === USER_INPUT_UNFOCUS) {
      input.removeEventListener('blur', input.focus);
    }

    next(action);
  };
}
