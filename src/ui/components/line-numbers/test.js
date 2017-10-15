import React from 'react';
import renderer from 'react-test-renderer';

import { updateConfig, updatePane } from 'ui/state/actions';
import { LineNumbers, mapDispatchToProps, mapStateToProps } from './index';

jest.mock('ui/utils', () => ({
  // Used by charSizes in mapStateToProps.
  computeFontDimensions: jest.fn(() => ({ width: 5, height: 20 })),
}));

jest.mock('ui/state/actions', () => ({
  updateConfig: jest.fn(),
  updatePane: jest.fn(),
}));

describe('LineNumbers', () => {
  const defaultProps = {
    className: '',
    currentLine: 0,
    firstVisibleChar: 0,
    firstVisibleLine: 0,
    innerRef: () => {},
    relative: false,
    totalLines: 0,
    visibleLines: 40,
    setActiveLine: jest.fn(),
  };
  const createSnapshot = (passedProps = {}) => {
    const props = {
      ...defaultProps,
      ...passedProps,
    };
    expect(renderer.create(<LineNumbers {...props} />).toJSON()).toMatchSnapshot();
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders at least one line even when empty', () => {
    createSnapshot();
  });

  it('allows passing in an external classname', () => {
    createSnapshot({
      className: 'custom-classname',
    });
  });

  it('adds an overlay class when firstVisibleChar is larger than 0', () => {
    createSnapshot({
      firstVisibleChar: 1,
    });
  });

  it('renders line numbers', () => {
    createSnapshot({
      totalLines: 3,
    });
  });

  it('starts zero-indexed when using relative line numbers', () => {
    createSnapshot({
      totalLines: 3,
      relative: true,
    });
  });

  it('renders relative line numbers when so configured', () => {
    createSnapshot({
      totalLines: 5,
      currentLine: 2,
      relative: true,
    });
  });

  it('starts off at the first visible line', () => {
    createSnapshot({
      totalLines: 5,
      currentLine: 2,
      firstVisibleLine: 2,
    });
  });

  it('starts off at the first visible line with relative line numbers', () => {
    createSnapshot({
      currentLine: 2,
      totalLines: 5,
      firstVisibleLine: 2,
      relative: true,
    });
  });

  it('should only render at most as many lines as are visible in the viewport', () => {
    createSnapshot({
      currentLine: 0,
      totalLines: 100,
      firstVisibleLine: 0,
      visibleLines: 10,
    });
  });

  it('setActiveLine should be called on click', () => {
    const lineNumbers = new LineNumbers(defaultProps);
    lineNumbers.setActiveLine({
      target: {
        dataset: {
          line: '7',
        },
      },
    });
    expect(defaultProps.setActiveLine).toHaveBeenCalledWith(7);

    lineNumbers.setActiveLine({
      target: {
        dataset: {},
      },
    });
    expect(defaultProps.setActiveLine).toHaveBeenCalledWith(defaultProps.totalLines - 1);
  });
});

describe('LineNumbers mapStateToProps', () => {
  const paneId = 1;
  const innerRef = jest.fn();
  const config = {
    theme: {},
    relativeLineNumbers: false,
  };
  const panes = [{
    id: paneId,
    column: 0,
    row: 0,
    lines: ['a', 'b', 'c'],
    height: 800,
    firstVisibleColumn: 0,
    firstVisibleRow: 1,
  }];
  const props = {
    paneId,
    innerRef,
    className: 'some-class',
  };

  it('should pass on, rename or compute passed state & props', () => {
    expect(mapStateToProps({ config, panes }, props)).toEqual({
      innerRef,
      className: 'some-class',
      currentLine: 0,
      firstVisibleChar: 0,
      firstVisibleLine: 1,
      relative: false,
      totalLines: 3,
      visibleLines: 800 / 20,
    });
  });
});

describe('LineNumbers mapDispatchToProps', () => {
  const dispatch = jest.fn();
  const props = { paneId: 1 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an object with a function to set the active line', () => {
    expect(mapDispatchToProps(dispatch, props).setActiveLine).toBeDefined();
  });

  it('setActiveLine should set the position in the pane when called', () => {
    const { setActiveLine } = mapDispatchToProps(dispatch, props);
    const row = 3;
    setActiveLine(row);
    expect(updatePane).toHaveBeenCalledWith(props.paneId, {
      row,
      column: 0,
    });
  });

  it('setActiveLine should mark the pane as the current pane when called', () => {
    const { setActiveLine } = mapDispatchToProps(dispatch, props);
    setActiveLine(3);
    expect(updateConfig).toHaveBeenCalledWith({
      currentPaneId: props.paneId,
    });
  });
});
