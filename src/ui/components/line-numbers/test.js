import React from 'react';
import renderer from 'react-test-renderer';
import _ from 'lodash';

import LineNumbers from './index';

const defaultProps = {
  className: '',
  config: {
    relativeLineNumbers: false,
  },
  view: {
    lines: [],
    row: 0,
    firstVisibleRow: 0,
    firstVisibleColumn: 0,
  },
};

const createSnapshot = (props = defaultProps) => {
  expect(
    renderer.create(<LineNumbers {...props} />).toJSON(),
  ).toMatchSnapshot();
};

test('LineNumbers renders at least one line even when empty', () => {
  createSnapshot();
});

test('LineNumbers allows passing in an external classname', () => {
  createSnapshot({
    ...defaultProps,
    className: 'custom-classname',
  });
});

test('LineNumbers adds an overlay class when firstVisibleColumn is larger than 0', () => {
  createSnapshot({
    ...defaultProps,
    view: {
      ...defaultProps.view,
      firstVisibleColumn: 1,
    },
  });
});

test('LineNumbers renders line numbers', () => {
  createSnapshot({
    ...defaultProps,
    view: {
      ...defaultProps.view,
      lines: _.range(3),
    },
  });
});

test('LineNumbers starts zero-indexed when using relative line numbers', () => {
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

test('LineNumbers renders relative line numbers when so configured', () => {
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

test('LineNumbers starts off at the first visible row', () => {
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

test('LineNumbers starts off at the first visible row with relative line numbers', () => {
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
