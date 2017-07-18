import fs from 'fs';
import path from 'path';
import { remote } from 'electron';

import { expandPath } from 'ui/utils';
import * as types from 'ui/state/types';
import { currentView } from 'ui/state/selectors';
import {
  createView,
  destroyView,
  toggleTreeView,
  updateConfig,
  userInputFocus,
} from 'ui/state/actions';

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
    } else if (command === 't') {
      dispatch(toggleTreeView());
    } else if (command === 'cd') {
      const directory = path.resolve(expandPath(args[0]));
      try {
        process.chdir(directory);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Could not change directory', err);
        return;
      }
      dispatch(updateConfig({ cwd: directory }));
    } else if (command === 'b') {
      const isBrowserVisible = !state.config.isBrowserVisible;
      dispatch(updateConfig({ isBrowserVisible }));
      if (isBrowserVisible) {
        dispatch(userInputFocus(false));
      }
    }

    next(action);
    dispatch(updateConfig({ mode: 'normal' }));
  };
}
