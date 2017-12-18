import { readFile } from 'lib/io';
import configureStore from 'ui/state/store/configure-store';

export const getConfigDefaults = () => ({
  mode: 'normal',
  isBrowserVisible: false,
  isTreeViewVisible: false,
  isTitleBarVisible: true,
  isUserTyping: false,
  cwd: process.cwd(),
});

export function getPreloadedState() {
  return JSON.parse(unescape(window.location.hash).slice(1));
}

export function getText(filename) {
  if (!filename) {
    return Promise.resolve();
  }
  return readFile(filename, { encoding: 'utf-8' });
}

export default () =>
  configureStore({
    getPreloadedState,
    getText,
    configDefaults: getConfigDefaults(),
  });
