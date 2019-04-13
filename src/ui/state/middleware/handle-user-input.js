import fixedKeys from 'ui/fixed-keys';
import * as commands from 'ui/commands';
import {
  updateConfig,
  updateCommand,
  createPane,
  updatePane,
} from 'ui/state/actions';
import { currentPane } from 'ui/state/selectors';

let stoppedTypingTimer;
export default function handleUserInput({ action, getState, dispatch }) {
  function onStoppedTyping() {
    dispatch(updateConfig({ isUserTyping: false }));
  }

  const { value, replacePrevious } = action;
  const state = getState();
  const { config } = state;
  const pane = currentPane(state);
  const payload = {
    ...pane,
    ...config,
    value,
    replacePrevious,
  };

  const keys = config.keys[config.mode];
  const handlers = Array.isArray(keys[value]) ? keys[value] : [keys[value]];
  const configHandlers = {
    exitMode: 'normal',
    enterExMode: 'ex',
    enterInsertMode: 'insert',
  };
  handlers.forEach(handler => {
    if (!handler && config.mode === 'insert' && !fixedKeys.has(payload.value)) {
      // Inserting a character.
      const command = replacePrevious ? commands.replace : commands.insert;
      dispatch(updatePane(pane.id, command(payload)));

      // Set isUserTyping as determined by whether the user has begun or
      // stopped typing.
      if (!config.isUserTyping) {
        dispatch(updateConfig({ isUserTyping: true }));
      }
      clearTimeout(stoppedTypingTimer);
      stoppedTypingTimer = setTimeout(onStoppedTyping, 500);
    } else if (configHandlers[handler]) {
      // Changing modes.
      const newMode = configHandlers[handler];

      // Create a new pane if the user goes into edit mode and no panes exist.
      if (newMode === 'insert' && !pane) {
        dispatch(createPane('unnamed', ''));
      }

      dispatch(updateConfig({ mode: newMode }));
      if (config.mode === 'insert' && newMode === 'normal') {
        const column = Math.max(0, pane.column - 1);
        dispatch(updatePane(pane.id, { column }));
      }
    } else if (handler) {
      // Executing a command.
      dispatch(updatePane(pane.id, commands[handler](payload)));
    } else if (config.mode === 'ex') {
      dispatch(updateCommand({ value }));
    }
  });
}
