import React from 'react';
import renderer from 'react-test-renderer';
import _ from 'lodash';

import { View } from './index';
import * as types from '../../state/types';

jest.mock('../cursor', () => 'Cursor');
jest.mock('../line-numbers', () => 'LineNumbers');

function createNodeMock (element) {
  if (element.type === 'div') {
    return {
      offsetWidth: 0,
      offsetHeight: 0,
    };
  }

  return null;
}

const defaultProps = {
  config: {
    charHeight: 20,
    charWidth: 5,
    showLineNumbers: false,
  },
  splits: 1,
  views: [],
  dispatch: () => {},
  isFirst: true,
  view: {
    id: 1,
    height: 800,
    lines: [],
    firstVisibleRow: 0,
    firstVisibleColumn: 0,
  },
  viewId: 1,
};

const createSnapshot = (props = defaultProps) => {
  expect(
    renderer.create(<View {...props} />, { createNodeMock },
  ).toJSON()).toMatchSnapshot();
};

describe('View', () => {
  it('renders empty content', () => {
    createSnapshot();
  });

  it('renders a Cursor in the current view', () => {
    createSnapshot({
      ...defaultProps,
      config: {
        ...defaultProps.config,
        currentViewId: 1,
      },
    });
  });

  it('renders LineNumbers when so configured', () => {
    createSnapshot({
      ...defaultProps,
      config: {
        ...defaultProps.config,
        showLineNumbers: true,
      },
    });
  });

  it('renders lines of code', () => {
    createSnapshot({
      ...defaultProps,
      view: {
        ...defaultProps.view,
        lines: [
          'hello, world!',
          'this is just marvellous!',
        ],
      },
    });
  });

  it('only renders visible lines', () => {
    // Since the line height is set to 20, and the configured view height is 100,
    // we will render 5 (100/20) lines, not the full 100.
    createSnapshot({
      ...defaultProps,
      view: {
        ...defaultProps.view,
        lines: _.range(100),
        height: 100,
      },
    });
  });

  it('starts rendering lines from the first visible row as configured', () => {
    createSnapshot({
      ...defaultProps,
      view: {
        ...defaultProps.view,
        lines: _.range(100),
        height: 100,
        firstVisibleRow: 10,
      },
    });
  });

  it('width is determined by the number of splits', () => {
    const createComponent = splits => {
      return renderer.create(
        <View {...defaultProps} splits={splits} />, { createNodeMock },
      ).toJSON();
    };
    expect(createComponent(1).props.style).toEqual({ width: '100%' });
    expect(createComponent(2).props.style).toEqual({ width: '50%' });
    expect(createComponent(3).props.style).toEqual({ width: `${ 100 / 3 }%` });
  });

  it('renders a border when it is not the first and there are no line numbers', () => {
    createSnapshot({
      ...defaultProps,
      isFirst: false,
      config: {
        ...defaultProps.config,
        showLineNumbers: false,
      },
    });
    createSnapshot({
      ...defaultProps,
      isFirst: false,
      config: {
        ...defaultProps.config,
        showLineNumbers: true,
      },
    });
  });

  it('has a left offset as determined by the first visible column', () => {
    createSnapshot({
      ...defaultProps,
      view: {
        ...defaultProps.view,
        firstVisibleColumn: 5,
      },
    });
  });

  it('should map store state to computed props', () => {
    const emptyState = {
      config: {},
      views: [],
    };
    const view = { id: 1 };
    const nonEmptyState = {
      config: {},
      views: [view],
    };
    const props = { viewId: view.id };

    expect(View.mapStateToProps(emptyState, props)).toEqual({
      config: {},
      splits: 0,
    });
    expect(View.mapStateToProps(nonEmptyState, props)).toEqual({
      view,
      config: {},
      splits: 1,
    });
  });

  it('should call onResize when receiving a different splits props value', () => {
    const onResize = jest.fn();
    const context = {
      onResize,
      props: {
        splits: 0,
      },
    };

    View.prototype.componentWillReceiveProps.call(context, { splits: 0 });
    expect(onResize).not.toHaveBeenCalled();

    View.prototype.componentWillReceiveProps.call(context, { splits: 1 });
    expect(onResize).toHaveBeenCalled();
  });

  it('should remove the onResize listener when the component unmounts', () => {
    const onResize = jest.fn();
    const context = { onResize };
    window.removeEventListener = jest.fn();
    View.prototype.componentWillUnmount.call(context, { splits: 1 });
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', onResize);
  });

  it('onResize takes the width of the numbers el into account when present', () => {
    const newDispatch = jest.fn();
    const props = {
      view: {
        id: 1,
      },
      dispatch: newDispatch,
    };

    const view = new View(props);
    view.wrapperEl = { offsetWidth: 800 };
    view.textEl = { offsetHeight: 600 };
    view.onResize.call({ props });
    expect(newDispatch).toHaveBeenCalledWith({
      type: types.UPDATE_VIEW,
      id: 1,
      width: 800,
      height: 600,
    });

    const secondView = new View(props);
    secondView.numbersEl = { offsetWidth: 50 };
    secondView.wrapperEl = { offsetWidth: 800 };
    secondView.textEl = { offsetHeight: 600 };
    secondView.onResize.call({ props });
    expect(newDispatch).toHaveBeenCalledWith({
      type: types.UPDATE_VIEW,
      id: 1,
      width: 750,
      height: 600,
    });
  });

  describe('onTextClick', () => {
    const currentTarget = {
      offsetLeft: 0,
      offsetRight: 0,
    };
    const event = {
      currentTarget,
      target: {},
      clientX: 0,
      clientY: 0,
    };
    const dispatch = jest.fn();
    const props = {
      dispatch,
      view: {
        id: 1,
        lines: [''],
        firstVisibleRow: 0,
      },
      config: {
        mode: 'insert',
        charWidth: 5,
        charHeight: 20,
        isBrowserVisible: true,
        currentViewId: 1,
      },
    };

    it('should calculate where the user clicked', () => {
      new View(props).onTextClick(event);
      expect(dispatch).toHaveBeenCalledWith({
        type: types.UPDATE_VIEW,
        id: 1,
        column: 0,
        row: 0,
      });

      new View(props).onTextClick({
        ...event,
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: types.UPDATE_VIEW,
        id: 1,
        column: 0,
        row: 0,
      });
    });

    it('should dispatch an action to focus user input if the browser is active', () => {
      new View(props).onTextClick(event);
      expect(dispatch).toHaveBeenCalledWith({
        type: types.USER_INPUT_FOCUS,
      });

      const newDispatch = jest.fn();
      new View({
        ...props,
        dispatch: newDispatch,
        config: {
          ...props.config,
          isBrowserVisible: false,
        },
      }).onTextClick(event);
      expect(newDispatch).not.toHaveBeenCalledWith({
        type: types.USER_INPUT_FOCUS,
      });
    });

    it('should dispatch an action to update the currently active view if the id changes', () => {
      new View(props).onTextClick(event);
      expect(dispatch).not.toHaveBeenCalledWith({
        type: types.UPDATE_CONFIG,
        currentViewId: 1,
      });

      new View({
        ...props,
        view: {
          ...props.view,
          id: 2,
        },
      }).onTextClick(event);
      expect(dispatch).toHaveBeenCalledWith({
        type: types.UPDATE_CONFIG,
        currentViewId: 2,
      });
    });

    it('may have a column offset of one in normal mode', () => {
      const newDispatch = jest.fn();
      const newProps = {
        ...props,
        dispatch: newDispatch,
        config: {
          mode: 'normal',
        },
        view: {
          ...props.view,
          lines: [
            'hello, world!',
            'this line is long',
            'and so is this one',
          ],
        },
      };
      new View(newProps).onTextClick(event);
      const expectedOutput = {
        type: types.UPDATE_VIEW,
        id: 1,
        column: 17,
        row: 2,
      };
      expect(newDispatch).toHaveBeenCalledWith(expectedOutput);

      new View({
        ...newProps,
        config: {
          mode: 'insert',
        },
      }).onTextClick(event);
      expect(newDispatch).toHaveBeenCalledWith({
        ...expectedOutput,
        column: 18,
      });
    });
  });
});
