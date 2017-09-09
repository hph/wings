import fs from 'fs-extra';
import path from 'path';
import { remote } from 'electron';

import { expandPath } from 'ui/utils';
import { currentView } from 'ui/state/selectors';
import {
  createView,
  destroyView,
  toggleTreeView as toggleTreeViewAction,
  updateConfig,
  userInputFocus,
} from 'ui/state/actions';

export function saveCurrentFile ({ args, state }) {
  const view = currentView(state);
  const filename = args.join(' ') || view.filename;
  const text = `${ view.lines.join('\n') }\n`;
  return fs.writeFile(filename, text);
}

export function exitCurrentFileOrApp ({ dispatch, state }) {
  const view = currentView(state);
  if (view) {
    dispatch(destroyView(view.id));
  } else {
    remote.getCurrentWindow().close();
  }
}

export function saveAndExit ({ args, dispatch, state }) {
  return saveCurrentFile({ args, state })
    .then(() => {
      exitCurrentFileOrApp({ dispatch, state });
    });
}

export function openFile ({ args, dispatch }) {
  const file = args.join(' ');
  if (file) {
    return fs.readFile(file, { encoding: 'utf-8' })
      .then(contents => {
        dispatch(createView(file, contents));
      })
      .catch(() => {
        dispatch(createView(file, ''));
      });
  }
  return Promise.resolve();
}

export function changeDirectory ({ args, dispatch }) {
  const directory = path.resolve(expandPath(args[0]));
  try {
    process.chdir(directory);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Could not change directory', err);
    return;
  }
  dispatch(updateConfig({ cwd: directory }));
}

export function toggleBrowser ({ state, dispatch }) {
  const isBrowserVisible = !state.config.isBrowserVisible;
  dispatch(updateConfig({ isBrowserVisible }));
  if (isBrowserVisible) {
    dispatch(userInputFocus(false));
  }
}

export function toggleTreeView ({ dispatch }) {
  dispatch(toggleTreeViewAction());
}
