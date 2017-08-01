import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';

import Root from './index';

jest.mock('electron', () => ({
  ipcRenderer: {
    send: jest.fn(),
  },
}));
jest.mock('../app', () => 'App');
jest.mock('../../state/store', () => (jest.fn(() => ({
  subscribe: () => {},
  getState: () => {},
  dispatch: () => {},
}))));

const rootDidMount = jest.spyOn(Root.prototype, 'componentDidMount');
const providerRender = jest.spyOn(Provider.prototype, 'render');

const defaultProps = {
  initialState: {
    filename: '',
    text: '',
    config: {},
  },
};

const createSnapshot = (props = defaultProps) => {
  expect(
    renderer.create(<Root {...props} />).toJSON(),
  ).toMatchSnapshot();
};

test('Root renders the App component', () => {
  createSnapshot();
});

test('Root renders inside a Redux Provider', () => {
  // There's probably a better way of doing this!
  expect(providerRender).toHaveBeenCalled();
});

test('Root creates a store', () => {
  const createStore = require('../../state/store'); // eslint-disable-line global-require

  expect(createStore.mock.calls.length).toBe(1);
  expect(createStore.mock.calls[0][0]).toEqual({ config: {} });
});

test('Root emits a message via RPC that the root has been mounted, once it has', () => {
  const { ipcRenderer } = require('electron'); // eslint-disable-line global-require

  expect(rootDidMount).toHaveBeenCalled();
  expect(ipcRenderer.send).toBeCalledWith('root-mounted', true);
});

test('Root creates a store and dispatches an action if provided with a file', () => {
  const createStore = require('../../state/store'); // eslint-disable-line global-require

  const dispatch = jest.fn();
  createStore.mockImplementation(() => ({
    dispatch,
    subscribe: () => {},
    getState: () => {},
  }));

  createSnapshot({
    initialState: {
      ...defaultProps.initialState,
      filename: 'truthy',
    },
  });

  expect(dispatch.mock.calls.length).toBe(1);
  expect(dispatch.mock.calls[0][0]).toEqual({
    filename: 'truthy',
    id: 1,
    text: '',
    type: 'CREATE_VIEW',
  });
});
