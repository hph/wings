import path from 'path';
import { remote } from 'electron';

import { readFile, writeFile } from 'lib/io';
import { expandPath } from 'ui/utils';
import { currentPane } from 'ui/state/selectors';
import {
  createPane,
  destroyPane,
  toggleTreeView as toggleTreeViewAction,
  updateConfig,
  userInputFocus,
} from 'ui/state/actions';

export function saveCurrentFile({ args, state }) {
  const pane = currentPane(state);
  const filename = args.join(' ') || pane.filename;
  const text = `${pane.lines.join('\n')}\n`;
  return writeFile(filename, text);
}

export function exitCurrentFileOrApp({ dispatch, state }) {
  const pane = currentPane(state);
  if (pane) {
    dispatch(destroyPane(pane.id));
  } else {
    remote.getCurrentWindow().close();
  }
}

export function saveAndExit({ args, dispatch, state }) {
  return saveCurrentFile({ args, state }).then(() => {
    exitCurrentFileOrApp({ dispatch, state });
  });
}

export function openFile({ args, dispatch }) {
  const file = args.join(' ').trim();
  if (file) {
    return readFile(file, { encoding: 'utf-8' })
      .then(contents => {
        dispatch(createPane(file, contents));
      })
      .catch(() => {
        dispatch(createPane(file, ''));
      });
  }

  dispatch(createPane('unnamed', ''));
  return Promise.resolve();
}

export function changeDirectory({ args, dispatch }) {
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

export function toggleBrowser({ state, dispatch }) {
  const isBrowserVisible = !state.config.isBrowserVisible;
  dispatch(updateConfig({ isBrowserVisible }));
  if (isBrowserVisible) {
    dispatch(userInputFocus(false));
  }
}

export function toggleTreeView({ dispatch }) {
  dispatch(toggleTreeViewAction());
}
