import React from 'react';
import renderer from 'react-test-renderer';

import { Pane, mapStateToProps } from './index';

jest.mock('ui/utils', () => ({
  computeFontDimensions: jest.fn(() => ({ width: 5, height: 21 })),
}));
jest.mock('ui/components/cursor', () => 'Cursor');
jest.mock('ui/components/line', () => 'Line');
jest.mock('ui/components/line-numbers', () => 'LineNumbers');

function createNodeMock(element) {
  if (element.type === 'div') {
    return {
      offsetWidth: 0,
      offsetHeight: 0,
    };
  }
  return null;
}

describe('Pane', () => {
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
    updatePane: () => {},
    userInputFocus: () => {},
    paneId: 1,
    panes: [],
    currentPaneId: 0,
    isBrowserVisible: false,
    mode: 'normal',
  };
  const createSnapshot = (passedProps = {}) => {
    const props = {
      ...defaultProps,
      ...passedProps,
    };
    expect(
      renderer.create(<Pane {...props} />, { createNodeMock }).toJSON(),
    ).toMatchSnapshot();
  };

  it('renders empty content', () => {
    createSnapshot();
  });

  it('renders a Cursor in the current pane', () => {
    createSnapshot({
      currentPaneId: 1,
    });
  });

  it('renders LineNumbers when so configured', () => {
    createSnapshot({
      showLineNumbers: true,
    });
  });

  it('should have test coverage for mock component refs', () => {
    const pane = new Pane(defaultProps);
    pane.numbersRef('mock');

    expect(pane.numbersEl).toEqual('mock');
  });

  it('renders lines of code', () => {
    createSnapshot({
      lines: ['hello, world!', 'this is just marvellous!'],
    });
  });

  it('only renders visible lines', () => {
    // Since the line height is set to 20, and the configured pane height is 100,
    // we will render 5 (100/20) lines, not the full 100.
    createSnapshot({
      lines: [...new Array(100).keys()].map(n => n.toString()),
      height: 100,
    });
  });

  it('starts rendering lines from the first visible row as configured', () => {
    createSnapshot({
      lines: [...new Array(100).keys()].map(n => n.toString()),
      height: 100,
      firstVisibleRow: 10,
    });
  });

  it('width is determined by the number of splits', () => {
    const createComponent = splits => {
      return renderer
        .create(<Pane {...defaultProps} splits={splits} />, { createNodeMock })
        .toJSON();
    };
    expect(createComponent(1).props.style).toEqual({ width: '100%' });
    expect(createComponent(2).props.style).toEqual({ width: '50%' });
    expect(createComponent(3).props.style).toEqual({ width: `${100 / 3}%` });
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
    const pane = {
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
        currentPaneId: 1,
        isBrowserVisible: false,
        mode: 'normal',
        showLineNumbers: false,
        theme: {},
      },
      panes: [pane],
    };
    const props = {
      paneId: pane.id,
    };

    const mappedState = mapStateToProps(state, props);
    delete pane.id;
    delete pane.width;
    delete state.config.theme;
    expect(mappedState).toEqual({
      ...pane,
      ...state.config,
      splits: state.panes.length,
      paneId: 1,
      charHeight: 21,
      charWidth: 5,
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

    Pane.prototype.componentWillReceiveProps.call(context, { splits: 0 });
    expect(onResize).not.toHaveBeenCalled();

    Pane.prototype.componentWillReceiveProps.call(context, { splits: 1 });
    expect(onResize).toHaveBeenCalled();
  });

  it('should remove the onResize listener when the component unmounts', () => {
    const onResize = jest.fn();
    const context = { onResize };
    window.removeEventListener = jest.fn();
    Pane.prototype.componentWillUnmount.call(context, { splits: 1 });
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', onResize);
  });

  it('onResize takes the width of the numbers el into account when present', () => {
    const updatePane = jest.fn();
    const props = {
      paneId: 1,
      updatePane,
    };

    const pane = new Pane(props);
    pane.wrapperEl = { offsetWidth: 800 };
    pane.textEl = { offsetHeight: 600 };
    pane.onResize.call({ props });
    expect(updatePane).toHaveBeenCalledWith(1, {
      width: 800,
      height: 600,
    });

    const secondPane = new Pane(props);
    secondPane.numbersEl = { offsetWidth: 50 };
    secondPane.wrapperEl = { offsetWidth: 800 };
    secondPane.textEl = { offsetHeight: 600 };
    secondPane.onResize.call({ props });
    expect(updatePane).toHaveBeenCalledWith(1, {
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
      paneId: 1,
      lines: ['hello, world!', 'how are you doing?'],
      firstVisibleRow: 0,
      mode: 'normal',
      charWidth: 5,
      charHeight: 20,
      isBrowserVisible: true,
      currentPaneId: 1,
      updateConfig: jest.fn(),
      updatePane: jest.fn(),
      userInputFocus: jest.fn(),
    };

    it('should calculate where the user clicked', () => {
      new Pane(props).onTextClick(event);
      expect(props.updatePane).toHaveBeenCalledWith(1, {
        column: 0,
        row: 0,
      });

      new Pane(props).onTextClick({
        ...event,
        clientX: 37,
        clientY: 0,
      });
      expect(props.updatePane).toHaveBeenCalledWith(1, {
        column: 7,
        row: 0,
      });

      new Pane(props).onTextClick({
        ...event,
        clientX: 37,
        clientY: 27,
      });
      expect(props.updatePane).toHaveBeenCalledWith(1, {
        column: 7,
        row: 1,
      });
    });

    it('should focus user input if the browser is active', () => {
      new Pane(props).onTextClick(event);
      expect(props.userInputFocus).toHaveBeenCalled();

      const newProps = {
        ...props,
        userInputFocus: jest.fn(),
        updateConfig: jest.fn(),
        isBrowserVisible: false,
      };
      new Pane(newProps).onTextClick(event);
      expect(newProps.userInputFocus).not.toHaveBeenCalled();
    });

    it('should update the currently active pane if the id changes', () => {
      new Pane(props).onTextClick(event);
      expect(props.updateConfig).not.toHaveBeenCalledWith({
        currentPaneId: 1,
      });

      const newProps = {
        ...props,
        paneId: 2,
      };

      new Pane(newProps).onTextClick(event);
      expect(newProps.updateConfig).toHaveBeenCalledWith({
        currentPaneId: 2,
      });
    });

    it('may have a column offset of one in insert mode', () => {
      const newProps = {
        ...props,
        updatePane: jest.fn(),
        lines: ['hello, world!', 'this line is long', 'and so is this one'],
      };
      const newEvent = {
        ...event,
        clientY: 15,
        clientX: 76,
      };
      new Pane(newProps).onTextClick(newEvent);
      expect(newProps.updatePane).toHaveBeenCalledWith(1, {
        column: 12,
        row: 0,
      });

      new Pane({
        ...newProps,
        mode: 'insert',
      }).onTextClick(newEvent);
      expect(newProps.updatePane).toHaveBeenCalledWith(1, {
        column: 13,
        row: 0,
      });
    });

    it('should select the same column within a line in both insert and normal mode', () => {
      const newProps = {
        ...props,
        updatePane: jest.fn(),
        lines: ['hello, world!'],
      };
      const newEvent = {
        ...event,
        clientY: 0,
        clientX: 13,
      };
      const expected = { column: 2, row: 0 };
      new Pane(newProps).onTextClick(newEvent);
      expect(newProps.updatePane).toHaveBeenCalledWith(1, expected);

      new Pane({
        ...newProps,
        mode: 'insert',
      }).onTextClick(newEvent);
      expect(newProps.updatePane).toHaveBeenCalledWith(1, expected);
    });

    it('should use the last line if the cursor clicked below it', () => {
      const newProps = {
        ...props,
        updatePane: jest.fn(),
        lines: ['hi!', 'this line will be focused when we click below it'],
      };
      const newEvent = {
        ...event,
        target: event.currentTarget,
        clientY: 100,
        clientX: 10,
      };
      new Pane(newProps).onTextClick(newEvent);

      expect(newProps.updatePane).toHaveBeenCalledWith(1, {
        column: 2,
        row: 1,
      });
    });
  });
});
