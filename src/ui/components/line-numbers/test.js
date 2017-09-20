import React from 'react';
import renderer from 'react-test-renderer';

import { LineNumbers, mapStateToProps } from './index';

describe('LineNumbers', () => {
  const createSnapshot = (passedProps = {}) => {
    const props = {
      className: '',
      currentLine: 0,
      firstVisibleChar: 0,
      firstVisibleLine: 0,
      innerRef: () => {},
      relative: false,
      totalLines: 0,
      visibleLines: 40,
      ...passedProps,
    };
    expect(renderer.create(<LineNumbers {...props} />).toJSON()).toMatchSnapshot();
  };

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
});

describe('LineNumbers mapStateToProps', () => {
  const viewId = 1;
  const innerRef = jest.fn();
  const config = {
    charHeight: 20,
    relativeLineNumbers: false,
  };
  const views = [{
    id: viewId,
    column: 0,
    row: 0,
    lines: ['a', 'b', 'c'],
    height: 800,
    firstVisibleColumn: 0,
    firstVisibleRow: 1,
  }];
  const props = {
    viewId,
    innerRef,
    className: 'some-class',
  };

  it('should pass on, rename or compute passed state & props', () => {
    expect(mapStateToProps({ config, views }, props)).toEqual({
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
