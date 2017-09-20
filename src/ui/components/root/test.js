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

describe('Root', () => {
  const rootDidMount = jest.spyOn(Root.prototype, 'componentDidMount');
  const providerRender = jest.spyOn(Provider.prototype, 'render');
  const defaultProps = {
    initialState: {
      filename: '',
      text: '',
      config: {},
    },
  };
  const createSnapshot = (passedProps = {}) => {
    const props = {
      ...defaultProps,
      ...passedProps,
    };
    expect(renderer.create(<Root {...props} />).toJSON()).toMatchSnapshot();
  };

  it('should render the App component', () => {
    createSnapshot();
  });

  it('should render inside a Redux Provider', () => {
    // There's probably a better way of doing this!
    expect(providerRender).toHaveBeenCalled();
  });

  it('should create a store', () => {
    // eslint-disable-next-line global-require
    const createStore = require('../../state/store');

    expect(createStore.mock.calls.length).toBe(1);
    expect(createStore.mock.calls[0][0]).toEqual({ config: {} });
  });

  it('should emit a message via RPC that the root has been mounted, once it has', () => {
    // eslint-disable-next-line global-require
    const { ipcRenderer } = require('electron');

    expect(rootDidMount).toHaveBeenCalled();
    expect(ipcRenderer.send).toBeCalledWith('root-mounted', true);
  });

  it('should create a store and dispatches an action if provided with a file', () => {
    // eslint-disable-next-line global-require
    const createStore = require('../../state/store');

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

    expect(dispatch).toHaveBeenCalledWith({
      filename: 'truthy',
      id: 1,
      text: '',
      type: 'CREATE_VIEW',
    });
  });
});
