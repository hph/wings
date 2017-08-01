import React from 'react';
import renderer from 'react-test-renderer';

import Cursor from './index';

const defaultProps = {
  config: {
    charHeight: 20,
    charWidth: 5,
    isUserTyping: true,
    mode: 'normal',
  },
  view: {
    lines: [''],
    column: 0,
    row: 0,
    firstVisibleRow: 0,
  },
};

const createSnapshot = (props = defaultProps) => {
  expect(
    renderer.create(<Cursor {...props} />).toJSON(),
  ).toMatchSnapshot();
};

test('Cursor is rendered with inline styles for positioning', () => {
  createSnapshot();
});

test('Cursor receives an "insertMode" class in insert mode', () => {
  createSnapshot({
    ...defaultProps,
    config: {
      ...defaultProps.config,
      mode: 'insert',
    },
  });
});

test('Cursor receives a "pulsate" class in insert mode while not typing', () => {
  createSnapshot({
    ...defaultProps,
    config: {
      ...defaultProps.config,
      mode: 'insert',
      isUserTyping: false,
    },
  });
});

test('Cursor renders the character under the cursor when not in insert mode', () => {
  createSnapshot({
    ...defaultProps,
    view: {
      ...defaultProps.view,
      lines: ['abc'],
      column: 1,
      row: 0,
    },
  });
});

test('Cursor positions the cursor by the column, row, and cursor dimensions', () => {
  const lines = ['abc', 'def', 'ghi'];
  createSnapshot({
    ...defaultProps,
    view: {
      ...defaultProps.view,
      lines,
      column: 1,
      row: 1,
    },
  });
  createSnapshot({
    ...defaultProps,
    view: {
      ...defaultProps.view,
      lines,
      column: 2,
      row: 2,
    },
  });
  createSnapshot({
    ...defaultProps,
    view: {
      ...defaultProps.view,
      lines,
      column: 2,
      row: 0,
    },
  });
});

test('Cursor takes firstVisibleRow into account to position relative to it', () => {
  createSnapshot({
    ...defaultProps,
    view: {
      ...defaultProps.view,
      firstVisibleRow: 1,
      lines: ['abc', 'def', 'ghi'],
      column: 1,
      row: 1,
    },
  });
});
