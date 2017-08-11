import React from 'react';
import renderer from 'react-test-renderer';

import { App } from './index';

jest.mock('dynamic-css-properties', () => jest.fn());
jest.mock('../browser', () => 'Browser');
jest.mock('../command-bar', () => 'CommandBar');
jest.mock('../logo', () => 'Logo');
jest.mock('../title-bar', () => 'TitleBar');
jest.mock('../tree-view', () => 'TreeView');
jest.mock('../view', () => 'View');

const defaultProps = {
  config: {
    isBrowserVisible: false,
    isTitleBarVisible: false,
    isTreeViewVisible: false,
    mode: 'normal',
    charWidth: 5,
  },
  views: [],
  dispatch: () => {},
};

const createSnapshot = (props = defaultProps) => {
  expect(renderer.create(<App {...props} />).toJSON()).toMatchSnapshot();
};

test('App defaults to rendering a logo in an empty state', () => {
  createSnapshot();
});

test('App renders a TitleBar when so configured', () => {
  createSnapshot({
    ...defaultProps,
    config: {
      ...defaultProps.config,
      isTitleBarVisible: true,
    },
  });
});

test('App renders a CommandBar in ex mode', () => {
  createSnapshot({
    ...defaultProps,
    config: {
      ...defaultProps.config,
      mode: 'ex',
    },
  });
});

test('App renders a TreeView when so configured', () => {
  createSnapshot({
    ...defaultProps,
    config: {
      ...defaultProps.config,
      isTreeViewVisible: true,
    },
  });
});

test('App renders a Browser when so configured', () => {
  createSnapshot({
    ...defaultProps,
    config: {
      ...defaultProps.config,
      isBrowserVisible: true,
    },
  });
});

test('App renders a View when so configured', () => {
  createSnapshot({
    ...defaultProps,
    views: [{ id: 1 }],
  });
});

test('App renders multiple instances of View when so configured', () => {
  createSnapshot({
    ...defaultProps,
    views: [{ id: 1 }, { id: 2 }],
  });
});

test('App can render many things at once when so configured', () => {
  createSnapshot({
    ...defaultProps,
    config: {
      isBrowserVisible: true,
      isTitleBarVisible: true,
      isTreeViewVisible: true,
      mode: 'normal',
    },
    views: [{ id: 1 }, { id: 2 }],
  });
});

test('App will set custom properties when initializing', () => {
  // eslint-disable-next-line global-require
  const setCustomProperties = require('dynamic-css-properties');

  renderer.create(<App {...defaultProps} />);
  expect(setCustomProperties).toHaveBeenCalled();
  expect(setCustomProperties.mock.calls[0][0]).toEqual({
    charWidth: '5px',
    viewportHeight: 'calc(100vh - var(--title-bar-height)',
  });
});

test('App will set a global resize event listener', () => {
  const addEventListener = jest.fn();
  global.addEventListener = addEventListener;
  renderer.create(<App {...defaultProps} />);
  expect(addEventListener).toHaveBeenCalled();
  expect(addEventListener.mock.calls[0][0]).toEqual('resize');
});
