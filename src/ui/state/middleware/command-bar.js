import * as exCommands from 'ui/ex-commands';
import * as types from 'ui/state/types';
import { updateConfig } from 'ui/state/actions';

export default function commandBar ({ getState, dispatch }) {
  return next => action => {
    if (action.type !== types.UPDATE_COMMAND || action.value !== 'Enter') {
      return next(action);
    }

    const state = getState();
    const [command, ...args] = state.command.split(' ');
    const handlerName = state.config.commands[command];
    const handler = exCommands[handlerName];
    if (!handler) {
      return next(action);
    }

    handler({ state, dispatch, args });
    const result = next(action);
    dispatch(updateConfig({ mode: 'normal' }));
    return result;
  };
}
