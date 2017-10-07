import React from 'react';
import renderer from 'react-test-renderer';
import { ipcRenderer, webFrame } from 'electron';

import { configureStore } from 'ui/state';
import Root from './index';

jest.mock('electron', () => ({
  ipcRenderer: {
    send: jest.fn(),
  },
  webFrame: {
    setVisualZoomLevelLimits: jest.fn(),
  },
}));

jest.mock('react-redux/lib/components/Provider', () => 'Provider');

jest.mock('ui/components/app', () => 'App');

jest.mock('ui/state', () => ({
  configureStore: jest.fn(() => Promise.resolve('fake store')),
}));

describe('Root', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initially render null', () => {
    expect(renderer.create(<Root />).toJSON()).toMatchSnapshot();
  });

  it('should render App within a Redux Provider once the store has been created', done => {
    const component = renderer.create(<Root />);
    setTimeout(() => {
      expect(component.toJSON()).toMatchSnapshot();
      done();
    });
  });

  it('should configure the store and set global options when instantiated', done => {
    const root = new Root();
    root.setState = jest.fn();

    expect(configureStore).toHaveBeenCalled();
    expect(webFrame.setVisualZoomLevelLimits).toHaveBeenCalledWith(1, 1);

    setTimeout(() => {
      expect(root.setState).toHaveBeenCalledWith({ store: 'fake store' });
      done();
    });
  });

  it('should notify Electron that the window can be shown in componentDidUpdate', () => {
    const root = new Root();
    root.setState = jest.fn();

    expect(ipcRenderer.send).not.toHaveBeenCalled();
    root.componentDidUpdate();
    expect(ipcRenderer.send).toHaveBeenCalledWith('root-mounted', true);
  });
});
