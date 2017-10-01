import React from 'react';
import renderer from 'react-test-renderer';

import { App, mapStateToProps } from './index';

jest.mock('dynamic-css-properties', () => jest.fn());
jest.mock('../browser', () => 'Browser');
jest.mock('../command-bar', () => 'CommandBar');
jest.mock('../logo', () => 'Logo');
jest.mock('../title-bar', () => 'TitleBar');
jest.mock('../tree-view', () => 'TreeView');
jest.mock('../pane', () => 'Pane');

const defaultProps = {
  isBrowserVisible: false,
  isTitleBarVisible: false,
  isTreeViewVisible: false,
  isCommandBarVisible: false,
  charWidth: 5,
  theme: {
    titleBarHeight: 23,
  },
  updateConfig: () => {},
  panes: [],
};

describe('App', () => {
  const createSnapshot = (passedProps) => {
    const props = {
      ...defaultProps,
      ...passedProps,
    };
    expect(renderer.create(<App {...props} />).toJSON()).toMatchSnapshot();
  };

  it('defaults to rendering a logo in an empty state', () => {
    createSnapshot();
  });

  it('renders a TitleBar when so configured', () => {
    createSnapshot({
      isTitleBarVisible: true,
    });
  });

  it('renders a CommandBar when so configured', () => {
    createSnapshot({
      isCommandBarVisible: true,
    });
  });

  it('renders a TreeView when so configured', () => {
    createSnapshot({
      isTreeViewVisible: true,
    });
  });

  it('renders a Browser when so configured', () => {
    createSnapshot({
      isBrowserVisible: true,
    });
  });

  it('renders a Pane when so configured', () => {
    createSnapshot({
      panes: [{ id: 1 }],
    });
  });

  it('renders multiple instances of Pane when so configured', () => {
    createSnapshot({
      panes: [{ id: 1 }, { id: 2 }],
    });
  });

  it('can render many things at once when so configured', () => {
    createSnapshot({
      isBrowserVisible: true,
      isTitleBarVisible: true,
      isTreeViewVisible: true,
      isCommandBarVisible: true,
      panes: [{ id: 1 }, { id: 2 }],
    });
  });

  it('will set custom properties when initializing', () => {
    // eslint-disable-next-line global-require
    const setCustomProperties = require('dynamic-css-properties');
    setCustomProperties.mockReset();

    const props = {
      ...defaultProps,
      isTitleBarVisible: true,
    };
    renderer.create(<App {...props} />);

    expect(setCustomProperties).toHaveBeenCalledWith({
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

    // calledWith matchers require all arguments, but we only know the first.
    let found = false;
    addEventListener.mock.calls.forEach(args => {
      if (args[0] === 'resize') {
        found = true;
      }
    });
    expect(found).toBe(true);
  });

  it('componentWillReceiveProps calls setCustomProperties when the theme changes', () => {
    // eslint-disable-next-line global-require
    const setCustomProperties = require('dynamic-css-properties');
    setCustomProperties.mockReset();

    const app = new App(defaultProps);
    app.setCustomProperties = jest.fn();
    app.componentWillReceiveProps(defaultProps);
    expect(app.setCustomProperties).not.toHaveBeenCalled();

    app.componentWillReceiveProps({
      ...defaultProps,
      theme: {
        color: 'hotpink',
      },
    });

    expect(app.setCustomProperties).toHaveBeenCalled();
    expect(setCustomProperties).toHaveBeenCalledWith({
      charWidth: '5px',
      titleBarHeight: '0px',
      viewportHeight: 'calc(100vh - var(--title-bar-height)',
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

describe('App showOrHideTitleBar', () => {
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
      isTitleBarVisible: false,
    });

    app.showOrHideTitleBar(new Date().getTime());
    expect(updateConfig).not.toHaveBeenCalled();

    window.innerHeight = 0;
    window.screen.height = 1;
    app.showOrHideTitleBar(new Date().getTime());
    expect(updateConfig).toHaveBeenCalledWith({ isTitleBarVisible: true });
  });

  it('should update css variables when the titlebar visibility changes', () => {
    // eslint-disable-next-line global-require
    const setCustomProperties = require('dynamic-css-properties');
    setCustomProperties.mockReset();

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
    expect(app.setCustomProperties).toHaveBeenCalled();
    expect(setCustomProperties).toHaveBeenCalledWith({
      charWidth: '5px',
      titleBarHeight: '0px',
      viewportHeight: 'calc(100vh - var(--title-bar-height)',
    });

    app = new App({
      ...props,
      isTitleBarVisible: true,
    });
    app.setCustomProperties = jest.fn();

    window.innerHeight = 0;
    window.screen.height = 0;
    app.showOrHideTitleBar(new Date().getTime());
    expect(app.setCustomProperties).toHaveBeenCalled();
    expect(setCustomProperties).toHaveBeenCalledWith({
      charWidth: '5px',
      titleBarHeight: '0px',
      viewportHeight: 'calc(100vh - var(--title-bar-height)',
    });
  });
});

describe('App mapStateToProps', () => {
  it('mapStateToProps returns props based on state', () => {
    expect(mapStateToProps({
      config: {
        charWidth: 10,
        isBrowserVisible: true,
        isTreeViewVisible: true,
        isTitleBarVisible: true,
        mode: 'normal',
        theme: {},
      },
      panes: [],
    })).toEqual({
      charWidth: 10,
      isBrowserVisible: true,
      isTreeViewVisible: true,
      isTitleBarVisible: true,
      isCommandBarVisible: false,
      theme: {},
      panes: [],
    });
  });
});
