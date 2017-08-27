import React from 'react';
import renderer from 'react-test-renderer';
import _ from 'lodash';

import LineNumbers from './index';

const defaultProps = {
  className: '',
  config: {
    charHeight: 5,
    relativeLineNumbers: false,
  },
  view: {
    lines: [],
    row: 0,
    firstVisibleRow: 0,
    firstVisibleColumn: 0,
  },
  innerRef: () => {},
};

const createSnapshot = (props = defaultProps) => {
  expect(
    renderer.create(<LineNumbers {...props} />).toJSON(),
  ).toMatchSnapshot();
};

describe('LineNumbers', () => {
  it('renders at least one line even when empty', () => {
    createSnapshot();
  });

  it('allows passing in an external classname', () => {
    createSnapshot({
      ...defaultProps,
      className: 'custom-classname',
    });
  });

  it('adds an overlay class when firstVisibleColumn is larger than 0', () => {
    createSnapshot({
      ...defaultProps,
      view: {
        ...defaultProps.view,
        firstVisibleColumn: 1,
      },
    });
  });

  it('renders line numbers', () => {
    createSnapshot({
      ...defaultProps,
      view: {
        ...defaultProps.view,
        lines: _.range(3),
      },
    });
  });

  it('starts zero-indexed when using relative line numbers', () => {
    createSnapshot({
      ...defaultProps,
      view: {
        ...defaultProps.view,
        lines: _.range(3),
      },
      config: {
        ...defaultProps.config,
        relativeLineNumbers: true,
      },
    });
  });

  it('renders relative line numbers when so configured', () => {
    createSnapshot({
      ...defaultProps,
      view: {
        ...defaultProps.view,
        lines: _.range(5),
        row: 2,
      },
      config: {
        ...defaultProps.config,
        relativeLineNumbers: true,
      },
    });
  });

  it('starts off at the first visible row', () => {
    createSnapshot({
      ...defaultProps,
      view: {
        ...defaultProps.view,
        lines: _.range(5),
        row: 2,
        firstVisibleRow: 2,
      },
    });
  });

  it('starts off at the first visible row with relative line numbers', () => {
    createSnapshot({
      ...defaultProps,
      view: {
        ...defaultProps.view,
        lines: _.range(5),
        row: 2,
        firstVisibleRow: 2,
      },
      config: {
        ...defaultProps.config,
        relativeLineNumbers: true,
      },
    });
  });

  it('only updates when properties change', () => {
    let lineNumbers = new LineNumbers(defaultProps);
    expect(lineNumbers.shouldComponentUpdate(defaultProps)).toBe(false);

    lineNumbers = new LineNumbers({
      ...defaultProps,
      className: 'newclass',
    });
    expect(lineNumbers.shouldComponentUpdate(defaultProps)).toBe(true);
  });
});
