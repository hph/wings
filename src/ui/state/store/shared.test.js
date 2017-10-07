import { readFile } from 'fs-extra';

import createConfigureStore from 'ui/state/store/configure-store';
import configureStore, {
  configDefaults,
  getPreloadedState,
  getText,
} from 'ui/state/store/shared';

jest.mock('fs-extra', () => ({
  readFile: jest.fn(),
}));

jest.mock('ui/state/store/configure-store', () => jest.fn());

describe('store configDefaults', () => {
  it('should return a specific object', () => {
    expect(configDefaults).toEqual({
      mode: 'normal',
      isBrowserVisible: false,
      isTreeViewVisible: false,
      isTitleBarVisible: true,
      isUserTyping: false,
    });
  });
});

describe('store getPreloadedState', () => {
  it('should return an object passed in as the hash in the window location', () => {
    const state = { example: true };
    window.location.hash = `#${ JSON.stringify(state) }`;
    expect(getPreloadedState()).toEqual(state);
  });
});

describe('store getText', () => {
  it('should return a promise even when not provided with a filename', () => {
    expect(getText().then).toBeInstanceOf(Function);
  });

  it('should read file contents when provided with a filename', () => {
    expect(readFile).not.toHaveBeenCalled();
    getText('file.txt');
    expect(readFile).toHaveBeenCalledWith('file.txt', { encoding: 'utf-8' });
  });
});

describe('store configureStore', () => {
  it('should call createConfigureStore to create the function', () => {
    expect(createConfigureStore).not.toHaveBeenCalled();
    configureStore();
    expect(createConfigureStore).toHaveBeenCalledWith({
      configDefaults,
      getPreloadedState,
      getText,
    });
  });
});
