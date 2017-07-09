import fs from 'fs';
import { remote } from 'electron';

import * as types from 'ui/state/types';
import { currentView } from 'ui/state/selectors';
import { createView, destroyView, updateConfig } from 'ui/state/actions';

export default function exCommands ({ getState, dispatch }) {
  return next => action => {
    if (action.type !== types.UPDATE_COMMAND || action.value !== 'Enter') {
      return next(action);
    }

    const state = getState();
    const view = currentView(state);
    const [command, ...args] = state.command.split(' ');
    if (command === 'w') {
      const filename = args.join(' ') || view.filename;
      const text = `${ view.lines.join('\n') }\n`;
      fs.writeFile(filename, text, (error) => {
        if (error) {
          throw error;
        }
      });
    } else if (command === 'q') {
      if (view) {
        dispatch(destroyView(view.id));
      } else {
        remote.getCurrentWindow().close();
      }
    } else if (command === 'o') {
      const file = args.join(' ');
      if (file) {
        fs.readFile(file, { encoding: 'utf-8' }, (err, contents) => {
          dispatch(createView(file, contents));
        });
      }
    }

    next(action);
    dispatch(updateConfig({ mode: 'normal' }));
  };
}
