import React from 'react';
import renderer from 'react-test-renderer';
import _ from 'lodash';

import { View } from './index';

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

test('View renders empty content', () => {
  createSnapshot();
});

test('View renders a Cursor in the current view', () => {
  createSnapshot({
    ...defaultProps,
    config: {
      ...defaultProps.config,
      currentViewId: 1,
    },
  });
});

test('View renders LineNumbers when so configured', () => {
  createSnapshot({
    ...defaultProps,
    config: {
      ...defaultProps.config,
      showLineNumbers: true,
    },
  });
});

test('View renders lines of code', () => {
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

test('View only renders visible lines', () => {
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

test('View starts rendering lines from the first visible row as configured', () => {
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

test('View width is determined by the number of splits', () => {
  const createComponent = splits => {
    return renderer.create(
      <View {...defaultProps} splits={splits} />, { createNodeMock },
    ).toJSON();
  };
  expect(createComponent(1).props.style).toEqual({ width: '100%' });
  expect(createComponent(2).props.style).toEqual({ width: '50%' });
  expect(createComponent(3).props.style).toEqual({ width: `${ 100 / 3 }%` });
});

test('View renders a border when it is not the first and there are no line numbers', () => {
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

test('View has a left offset as determined by the first visible column', () => {
  createSnapshot({
    ...defaultProps,
    view: {
      ...defaultProps.view,
      firstVisibleColumn: 5,
    },
  });
});
