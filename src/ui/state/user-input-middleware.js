import _ from 'lodash';

import fixedKeys from 'ui/fixed-keys';
import * as commands from 'ui/commands';
import { updateConfig, updateView } from 'ui/state/actions';

/**
 * This middleware concerns itself with setting up an invisible input field to
 * capture all user input and retain focus at all times. Entered characters are
 * delegated to specialized handlers that in turn ultimately dispatch actions.
 * The created input element is set up with all the necessary event handlers to
 * deal with normal characters  as well as composed characters (such as "á",
 * which is composed of "´" and "a").
 */
export default function createUserInputMiddleware () {
  const input = document.createElement('input');
  input.style.position = 'absolute';
  input.style.top = '-1000px';
  input.style.left = '0';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.focus();

  // Automatically reinstate focus if lost (on external click events, etc).
  input.addEventListener('blur', input.focus);

  return ({ getState, dispatch }) => {
    function delegate ({ value, replaceLast, fixed }) {
      const state = getState();
      const view = state.views[0]; // Temporary while we only have one view.
      const payload = {
        ...view,
        ...state.config,
        value,
        replaceLast,
      };
      const modeHandlers = state.config.keys[state.config.mode];
      const handlers = _.castArray(modeHandlers[value]);
      const configHandlers = {
        exitMode: 'normal',
        enterExMode: 'ex',
        enterInsertMode: 'insert',
      };
      _.forEach(handlers, (handler) => {
        if (_.has(configHandlers, handler)) {
          const newMode = configHandlers[handler];
          dispatch(updateConfig({ mode: newMode }));
          if (state.config.mode === 'insert' && newMode === 'normal') {
            const column = _.max([0, view.column - 1]);
            dispatch(updateView(view.id, { column }));
          }
        } else if (handler) {
          dispatch(updateView(view.id, commands[handler](payload)));
        } else if (state.config.mode === 'insert' && !fixed) {
          const command = replaceLast ? commands.replace : commands.insert;
          dispatch(updateView(view.id, command(payload)));
        }
      });
    }

    input.addEventListener('keydown', (event) => {
      event.preventDefault();
      const value = event.key;
      if (!event.isComposing) {
        if (fixedKeys.has(value)) {
          delegate({ value, fixed: true });
        } else if (value !== 'Dead') {
          delegate({ value });
        }
      }
    });

    let composedValue;

    input.addEventListener('compositionstart', () => {
      composedValue = '';
    });

    input.addEventListener('compositionupdate', ({ data }) => {
      if (composedValue === '') {
        composedValue = data;
        delegate({ value: data });
      }
    });

    input.addEventListener('compositionend', ({ data }) => {
      if (composedValue !== data) {
        const [firstChar, secondChar] = data;

        if (firstChar !== composedValue) {
          delegate({ value: firstChar, replaceLast: true });
        }

        if (data.length === 2) {
          delegate({ value: secondChar });
        }
      }
    });

    return next => action => next(action);
  };
}
