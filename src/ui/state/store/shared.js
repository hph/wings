import { readFile } from 'fs-extra';

import configureStore from 'ui/state/store/configure-store';

export const configDefaults = {
  mode: 'normal',
  isBrowserVisible: false,
  isTreeViewVisible: false,
  isTitleBarVisible: true,
  isUserTyping: false,
};

export function getPreloadedState () {
  return JSON.parse(window.location.hash.slice(1));
}

export function getText (filename) {
  if (!filename) {
    return Promise.resolve();
  }
  return readFile(filename, { encoding: 'utf-8' });
}

export default () => configureStore({ configDefaults, getPreloadedState, getText });
