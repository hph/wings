import React from 'react';
import renderer from 'react-test-renderer';

import Line from './index';

const defaultProps = {
  children: '',
  row: 0,
};

const createSnapshot = (props) => {
  const renderProps = {
    ...defaultProps,
    ...props,
  };
  expect(
    renderer.create(<Line {...renderProps} />).toJSON(),
  ).toMatchSnapshot();
};

describe('Line', () => {
  it('should render an empty normal line', () => {
    createSnapshot({ children: '' });
  });

  it('should render a non-empty normal line', () => {
    createSnapshot({ children: 'this is some content' });
  });

  it('should highlight text within a line', () => {
    createSnapshot({
      children: 'so, highlight "this" and only that',
      row: 0,
      selection: {
        columnEnd: 18,
        columnStart: 15,
        rowEnd: 0,
        rowStart: 0,
      },
    });
  });

  it('should continue highlighting a line from a previous line', () => {
    createSnapshot({
      children: 'keep highlighting - but no more',
      row: 1,
      selection: {
        columnEnd: 16,
        columnStart: 0,
        rowEnd: 1,
        rowStart: 0,
      },
    });
  });

  it('should start highlighting within a line and continue highlighting', () => {
    createSnapshot({
      children: 'from here to eternity',
      row: 0,
      selection: {
        columnEnd: 0,
        columnStart: 5,
        rowEnd: 1,
        rowStart: 0,
      },
    });
  });

  it('should highlight a line within selection boundaries', () => {
    createSnapshot({
      children: 'foo bar baz',
      row: 1,
      selection: {
        columnEnd: 0,
        columnStart: 0,
        rowEnd: 2,
        rowStart: 0,
      },
    });
  });
});
