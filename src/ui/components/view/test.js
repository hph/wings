import React from 'react';
import renderer from 'react-test-renderer';
import _ from 'lodash';

import { View, mapStateToProps } from './index';

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

describe('View', () => {
  const defaultProps = {
    charHeight: 20,
    charWidth: 5,
    firstVisibleColumn: 0,
    firstVisibleRow: 0,
    height: 800,
    isFirst: true,
    lines: [],
    showLineNumbers: false,
    splits: 1,
    updateConfig: () => {},
    updateView: () => {},
    userInputFocus: () => {},
    viewId: 1,
    views: [],
    currentViewId: 0,
    isBrowserVisible: false,
    mode: 'normal',
  };
  const createSnapshot = (passedProps = {}) => {
    const props = {
      ...defaultProps,
      ...passedProps,
    };
    expect(
      renderer.create(<View {...props} />, { createNodeMock }).toJSON(),
    ).toMatchSnapshot();
  };

  it('renders empty content', () => {
    createSnapshot();
  });

  it('renders a Cursor in the current view', () => {
    createSnapshot({
      currentViewId: 1,
    });
  });

  it('renders LineNumbers when so configured', () => {
    createSnapshot({
      showLineNumbers: true,
    });
  });

  it('should have test coverage for mock component refs', () => {
    const view = new View(defaultProps);
    view.numbersRef('mock');

    expect(view.numbersEl).toEqual('mock');
  });

  it('renders lines of code', () => {
    createSnapshot({
      lines: [
        'hello, world!',
        'this is just marvellous!',
      ],
    });
  });

  it('only renders visible lines', () => {
    // Since the line height is set to 20, and the configured view height is 100,
    // we will render 5 (100/20) lines, not the full 100.
    createSnapshot({
      lines: _.range(100).map(n => n.toString()),
      height: 100,
    });
  });

  it('starts rendering lines from the first visible row as configured', () => {
    createSnapshot({
      lines: _.range(100).map(n => n.toString()),
      height: 100,
      firstVisibleRow: 10,
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
      isFirst: false,
      showLineNumbers: false,
    });
    createSnapshot({
      isFirst: false,
      showLineNumbers: true,
    });
  });

  it('has a left offset as determined by the first visible column', () => {
    createSnapshot({
      firstVisibleColumn: 5,
    });
  });

  it('should map store state to computed props', () => {
    const view = {
      id: 1,
      column: 1,
      height: 2,
      width: 3,
      lines: ['a', 'b', 'c'],
      firstVisibleColumn: 4,
      firstVisibleRow: 5,
    };
    const state = {
      config: {
        charHeight: 6,
        charWidth: 7,
        currentViewId: 1,
        isBrowserVisible: false,
        mode: 'normal',
        showLineNumbers: false,
      },
      views: [view],
    };
    const props = {
      viewId: view.id,
    };

    expect(mapStateToProps(state, props)).toEqual({
      ..._.omit(view, 'id', 'width'),
      ...state.config,
      splits: state.views.length,
      viewId: view.id,
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
    const updateView = jest.fn();
    const props = {
      viewId: 1,
      updateView,
    };

    const view = new View(props);
    view.wrapperEl = { offsetWidth: 800 };
    view.textEl = { offsetHeight: 600 };
    view.onResize.call({ props });
    expect(updateView).toHaveBeenCalledWith(1, {
      width: 800,
      height: 600,
    });

    const secondView = new View(props);
    secondView.numbersEl = { offsetWidth: 50 };
    secondView.wrapperEl = { offsetWidth: 800 };
    secondView.textEl = { offsetHeight: 600 };
    secondView.onResize.call({ props });
    expect(updateView).toHaveBeenCalledWith(1, {
      width: 750,
      height: 600,
    });
  });

  describe('onTextClick', () => {
    const currentTarget = {
      offsetTop: 0,
      offsetLeft: 0,
      offsetRight: 0,
    };
    const event = {
      currentTarget,
      target: {},
      clientX: 0,
      clientY: 0,
    };
    const props = {
      viewId: 1,
      lines: [
        'hello, world!',
        'how are you doing?',
      ],
      firstVisibleRow: 0,
      mode: 'normal',
      charWidth: 5,
      charHeight: 20,
      isBrowserVisible: true,
      currentViewId: 1,
      updateConfig: jest.fn(),
      updateView: jest.fn(),
      userInputFocus: jest.fn(),
    };

    it('should calculate where the user clicked', () => {
      new View(props).onTextClick(event);
      expect(props.updateView).toHaveBeenCalledWith(1, {
        column: 0,
        row: 0,
      });

      new View(props).onTextClick({
        ...event,
        clientX: 37,
        clientY: 0,
      });
      expect(props.updateView).toHaveBeenCalledWith(1, {
        column: 7,
        row: 0,
      });

      new View(props).onTextClick({
        ...event,
        clientX: 37,
        clientY: 27,
      });
      expect(props.updateView).toHaveBeenCalledWith(1, {
        column: 7,
        row: 1,
      });
    });

    it('should focus user input if the browser is active', () => {
      new View(props).onTextClick(event);
      expect(props.userInputFocus).toHaveBeenCalled();

      const newProps = {
        ...props,
        userInputFocus: jest.fn(),
        updateConfig: jest.fn(),
        isBrowserVisible: false,
      };
      new View(newProps).onTextClick(event);
      expect(newProps.userInputFocus).not.toHaveBeenCalled();
    });

    it('should update the currently active view if the id changes', () => {
      new View(props).onTextClick(event);
      expect(props.updateConfig).not.toHaveBeenCalledWith({
        currentViewId: 1,
      });

      const newProps = {
        ...props,
        viewId: 2,
      };

      new View(newProps).onTextClick(event);
      expect(newProps.updateConfig).toHaveBeenCalledWith({
        currentViewId: 2,
      });
    });

    it('may have a column offset of one in insert mode', () => {
      const newProps = {
        ...props,
        updateView: jest.fn(),
        lines: [
          'hello, world!',
          'this line is long',
          'and so is this one',
        ],
      };
      const newEvent = {
        ...event,
        clientY: 15,
        clientX: 76,
      };
      new View(newProps).onTextClick(newEvent);
      expect(newProps.updateView).toHaveBeenCalledWith(1, {
        column: 12,
        row: 0,
      });

      new View({
        ...newProps,
        mode: 'insert',
      }).onTextClick(newEvent);
      expect(newProps.updateView).toHaveBeenCalledWith(1, {
        column: 13,
        row: 0,
      });
    });

    it('should select the same column within a line in both insert and normal mode', () => {
      const newProps = {
        ...props,
        updateView: jest.fn(),
        lines: [
          'hello, world!',
        ],
      };
      const newEvent = {
        ...event,
        clientY: 0,
        clientX: 13,
      };
      const expected = { column: 2, row: 0 };
      new View(newProps).onTextClick(newEvent);
      expect(newProps.updateView).toHaveBeenCalledWith(1, expected);

      new View({
        ...newProps,
        mode: 'insert',
      }).onTextClick(newEvent);
      expect(newProps.updateView).toHaveBeenCalledWith(1, expected);
    });

    it('should use the last line if the cursor clicked below it', () => {
      const newProps = {
        ...props,
        updateView: jest.fn(),
        lines: [
          'hi!',
          'this line will be focused when we click below it',
        ],
      };
      const newEvent = {
        ...event,
        target: event.currentTarget,
        clientY: 100,
        clientX: 10,
      };
      new View(newProps).onTextClick(newEvent);

      expect(newProps.updateView).toHaveBeenCalledWith(1, { column: 2, row: 1 });
    });
  });
});
