import React from 'react';
import renderer from 'react-test-renderer';
import setCustomProperties from 'dynamic-css-properties';

import { updateConfig } from 'ui/state/actions';
import {
  App,
  setTheme,
  isFullscreen,
  mapDispatchToProps,
  mapStateToProps,
} from './index';

jest.mock('dynamic-css-properties', () => jest.fn());
jest.mock('ui/components/browser', () => 'Browser');
jest.mock('ui/components/command-bar', () => 'CommandBar');
jest.mock('ui/components/logo', () => 'Logo');
jest.mock('ui/components/title-bar', () => 'TitleBar');
jest.mock('ui/components/tree-view', () => 'TreeView');
jest.mock('ui/components/pane', () => 'Pane');
jest.mock('ui/utils', () => ({
  computeFontDimensions: jest.fn(() => ({ width: 5, height: 21 })),
}));
jest.mock('ui/state/actions', () => ({
  updateConfig: jest.fn(),
}));

const defaultProps = {
  isBrowserVisible: false,
  isTitleBarVisible: false,
  isTreeViewVisible: false,
  isFullscreen: jest.fn(false),
  showTitleBar: jest.fn(),
  setTheme: jest.fn(),
  isCommandBarVisible: false,
  charWidth: 5,
  theme: {
    titleBarHeight: 23,
  },
  panes: [],
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createSnapshot = passedProps => {
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

  it('will call setTheme with the provided props when instantiated', () => {
    new App(defaultProps); // eslint-disable-line no-new
    expect(defaultProps.setTheme).toHaveBeenCalledWith(defaultProps);
  });

  it('will set a global resize event listener on mount', () => {
    window.addEventListener = jest.fn();
    const app = new App(defaultProps);
    app.componentDidMount();

    expect(window.addEventListener).toHaveBeenCalledWith(
      'resize',
      app.onResize,
    );
  });

  it('calls setTheme in componentWillReceiveProps when the theme changes', () => {
    const app = new App(defaultProps);
    defaultProps.setTheme.mockReset();
    app.componentWillReceiveProps(defaultProps);
    expect(defaultProps.setTheme).not.toHaveBeenCalled();

    const nextProps = {
      ...defaultProps,
      theme: {
        color: 'hotpink',
      },
    };
    app.componentWillReceiveProps(nextProps);
    expect(defaultProps.setTheme).toHaveBeenCalledWith(nextProps);
  });

  it('should call showTitleBar in onResize', () => {
    const app = new App(defaultProps);
    app.showOrHideTitleBar = jest.fn();
    app.onResize();

    expect(app.showOrHideTitleBar).toHaveBeenCalledWith(expect.any(Number));
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
    const app = new App({
      ...defaultProps,
      isTitleBarVisible: false,
    });

    app.showOrHideTitleBar(new Date().getTime());

    window.innerHeight = 0;
    window.screen.height = 1;
    app.showOrHideTitleBar(new Date().getTime());
    expect(defaultProps.showTitleBar).toHaveBeenCalledWith(true);
  });

  it('should update css variables when the titlebar visibility changes', () => {
    window.requestAnimationFrame = jest.fn();
    let app = new App(defaultProps);
    defaultProps.setTheme.mockReset();

    window.innerHeight = 0;
    window.screen.height = 0;
    app.showOrHideTitleBar(new Date().getTime());
    expect(defaultProps.setTheme).toHaveBeenCalledWith({
      charWidth: 5,
      isTitleBarVisible: true,
      theme: {
        titleBarHeight: 23,
      },
    });

    window.innerHeight = 0;
    window.screen.height = 1;
    defaultProps.setTheme.mockReset();
    app.showOrHideTitleBar(new Date().getTime());
    expect(defaultProps.setTheme).toHaveBeenCalled();

    const props = {
      ...defaultProps,
      isTitleBarVisible: true,
    };
    app = new App(props);

    window.innerHeight = 0;
    window.screen.height = 0;
    app.showOrHideTitleBar(new Date().getTime());
    expect(props.setTheme).toHaveBeenCalledWith(props);
  });

  it('should render an error boundary when componentDidCatch is fired', () => {
    const app = new App(defaultProps);
    app.setState = jest.fn();
    const error = new Error('some error');
    const info = { componentStack: 'some info' };
    app.componentDidCatch(error, info);
    expect(app.setState).toHaveBeenCalledWith({
      error,
      errorStack: info.componentStack,
    });
  });

  it('should render an error boundary when there is an error', () => {
    const component = renderer.create(<App {...defaultProps} />);
    expect(component.toJSON()).toMatchSnapshot();
    component.getInstance().setState({
      error: new Error('an error'),
      errorStack: 'some stack info',
    });
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('setTheme', () => {
  it('should call setCustomProperties with options computed from the provided arguments', () => {
    setTheme({
      charWidth: 5,
      isTitleBarVisible: true,
      theme: {
        titleBarHeight: 23,
      },
    });
    expect(setCustomProperties).toHaveBeenCalledWith({
      charWidth: '5px',
      titleBarHeight: 23,
      viewportHeight: 'calc(100vh - var(--title-bar-height)',
    });
  });

  it('should pass on other theme properties', () => {
    setTheme({
      charWidth: 5,
      isTitleBarVisible: false,
      theme: {
        titleBarHeight: 23,
        anotherThemeVariable: 'red',
      },
    });
    expect(setCustomProperties).toHaveBeenCalledWith(
      expect.objectContaining({
        anotherThemeVariable: 'red',
      }),
    );
  });
});

describe('isFullscreen', () => {
  it('should returns the equality of the inner and screen height', () => {
    window.innerHeight = 10;
    window.screen.height = 20;
    expect(isFullscreen()).toBe(false);

    window.innerHeight = 10;
    window.screen.height = 10;
    expect(isFullscreen()).toBe(true);
  });
});

describe('App mapStateToProps', () => {
  it('mapStateToProps returns props based on state', () => {
    expect(
      mapStateToProps({
        config: {
          isBrowserVisible: true,
          isTreeViewVisible: true,
          isTitleBarVisible: true,
          mode: 'normal',
          theme: {},
        },
        panes: [],
      }),
    ).toEqual({
      charWidth: 5,
      isBrowserVisible: true,
      isTreeViewVisible: true,
      isTitleBarVisible: true,
      isCommandBarVisible: false,
      theme: {},
      panes: [],
    });
  });
});

describe('mapDispatchToProps', () => {
  it('should provide various functions as props', () => {
    const funcs = Object.keys(mapDispatchToProps());
    expect(funcs).toEqual(['setTheme', 'isFullscreen', 'showTitleBar']);
  });

  it('should provide a showTitleBar function that wraps updateConfig', () => {
    const dispatch = jest.fn();
    const { showTitleBar } = mapDispatchToProps(dispatch);
    showTitleBar(true);
    expect(updateConfig).toHaveBeenCalledWith({ isTitleBarVisible: true });
    expect(dispatch).toHaveBeenCalled();
  });
});
