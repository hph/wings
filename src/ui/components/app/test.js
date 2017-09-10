import React from 'react';
import renderer from 'react-test-renderer';

import { App, mapStateToProps } from './index';

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
    theme: {
      titleBarHeight: 23,
    },
  },
  updateConfig: () => {},
  views: [],
};

const createSnapshot = (props = defaultProps) => {
  expect(renderer.create(<App {...props} />).toJSON()).toMatchSnapshot();
};

describe('App', () => {
  it('defaults to rendering a logo in an empty state', () => {
    createSnapshot();
  });

  it('renders a TitleBar when so configured', () => {
    createSnapshot({
      ...defaultProps,
      config: {
        ...defaultProps.config,
        isTitleBarVisible: true,
      },
    });
  });

  it('renders a CommandBar in ex mode', () => {
    createSnapshot({
      ...defaultProps,
      config: {
        ...defaultProps.config,
        mode: 'ex',
      },
    });
  });

  it('renders a TreeView when so configured', () => {
    createSnapshot({
      ...defaultProps,
      config: {
        ...defaultProps.config,
        isTreeViewVisible: true,
      },
    });
  });

  it('renders a Browser when so configured', () => {
    createSnapshot({
      ...defaultProps,
      config: {
        ...defaultProps.config,
        isBrowserVisible: true,
      },
    });
  });

  it('renders a View when so configured', () => {
    createSnapshot({
      ...defaultProps,
      views: [{ id: 1 }],
    });
  });

  it('renders multiple instances of View when so configured', () => {
    createSnapshot({
      ...defaultProps,
      views: [{ id: 1 }, { id: 2 }],
    });
  });

  it('can render many things at once when so configured', () => {
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

  it('will set custom properties when initializing', () => {
    // eslint-disable-next-line global-require
    const setCustomProperties = require('dynamic-css-properties');

    renderer.create(<App {...defaultProps} />);
    expect(setCustomProperties).toHaveBeenCalled();
    expect(setCustomProperties.mock.calls[0][0]).toEqual({
      charWidth: '5px',
      viewportHeight: 'calc(100vh - var(--title-bar-height)',
      titleBarHeight: 23,
    });
  });

  it('will set a global resize event listener', () => {
    const addEventListener = jest.fn();
    global.addEventListener = addEventListener;
    renderer.create(<App {...defaultProps} />);
    expect(addEventListener).toHaveBeenCalled();
    expect(addEventListener.mock.calls[0][0]).toEqual('resize');
  });

  it('mapStateToProps returns config and views from the store', () => {
    expect(mapStateToProps({
      config: {},
      views: [],
    })).toEqual({
      config: {},
      views: [],
    });
  });

  it('componentWillReceiveProps calls setCustomProperties when the theme changes', () => {
    const app = new App(defaultProps);
    app.setCustomProperties = jest.fn();
    app.componentWillReceiveProps(defaultProps);
    expect(app.setCustomProperties).not.toHaveBeenCalled();

    app.componentWillReceiveProps({
      ...defaultProps,
      config: {
        ...defaultProps.config,
        theme: {
          color: 'hotpink',
        },
      },
    });
    expect(app.setCustomProperties).toHaveBeenCalledWith({
      charWidth: 5,
      isBrowserVisible: false,
      isTitleBarVisible: false,
      isTreeViewVisible: false,
      mode: 'normal',
      theme: {
        color: 'hotpink',
      },
    });
  });

  it('sets up a resize event listener on mount', () => {
    window.addEventListener = jest.fn();
    const app = new App(defaultProps);
    app.componentDidMount();
    expect(window.addEventListener).toHaveBeenCalledWith('resize', app.onResize);
  });

  it('onResize calls showOrHideTitleBar', () => {
    const app = new App(defaultProps);
    app.showOrHideTitleBar = jest.fn();
    app.onResize.call(defaultProps);
    expect(app.showOrHideTitleBar).toHaveBeenCalled();
  });

  it('windowIsFullscreen returns the equality of the inner and screen height', () => {
    const app = new App(defaultProps);

    window.innerHeight = 10;
    window.screen.height = 20;
    expect(app.windowIsFullscreen()).toBe(false);

    window.innerHeight = 10;
    window.screen.height = 10;
    expect(app.windowIsFullscreen()).toBe(true);
  });
});

describe('showOrHideTitleBar', () => {
  it('should exit if more than 150 ms have passed', () => {
    window.requestAnimationFrame = jest.fn();
    const app = new App(defaultProps);

    app.showOrHideTitleBar(new Date().getTime() - 200);
    // This function is always called if it does not exit.
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();

    app.showOrHideTitleBar(new Date().getTime());
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should update the visiblity of the titlebar as required', () => {
    window.requestAnimationFrame = jest.fn();
    const updateConfig = jest.fn();
    const app = new App({
      ...defaultProps,
      updateConfig,
      config: {
        ...defaultProps.config,
        isTitleBarVisible: false,
      },
    });

    app.showOrHideTitleBar(new Date().getTime());
    expect(updateConfig).not.toHaveBeenCalled();

    window.innerHeight = 0;
    window.screen.height = 1;
    app.showOrHideTitleBar(new Date().getTime());
    expect(updateConfig).toHaveBeenCalledWith({ isTitleBarVisible: true });
  });

  it('should update css variables when the titlebar visibility changes', () => {
    window.requestAnimationFrame = jest.fn();
    const updateConfig = jest.fn();
    const props = {
      ...defaultProps,
      updateConfig,
    };

    let app = new App(props);
    app.setCustomProperties = jest.fn();

    window.innerHeight = 0;
    window.screen.height = 0;
    app.showOrHideTitleBar(new Date().getTime());
    expect(app.setCustomProperties).not.toHaveBeenCalled();

    window.innerHeight = 0;
    window.screen.height = 1;
    app.showOrHideTitleBar(new Date().getTime());
    expect(app.setCustomProperties).toHaveBeenCalledWith({
      titleBarHeight: 23,
    });

    app = new App({
      ...props,
      config: {
        ...defaultProps.config,
        isTitleBarVisible: true,
      },
    });
    app.setCustomProperties = jest.fn();

    window.innerHeight = 0;
    window.screen.height = 0;
    app.showOrHideTitleBar(new Date().getTime());
    expect(app.setCustomProperties).toHaveBeenCalledWith({
      titleBarHeight: '0px',
    });
  });
});
