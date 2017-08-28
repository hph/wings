import React from 'react';
import renderer from 'react-test-renderer';

import RecursiveInnerTree from './index';

jest.mock('../../utils', () => ({
  listContents: jest.fn(() => Promise.resolve()),
}));

const defaultProps = {
  path: '/',
  dispatch: jest.fn(),
};

const createSnapshot = (props = defaultProps) => {
  expect(
    renderer.create(<RecursiveInnerTree {...props} />).toJSON(),
  ).toMatchSnapshot();
};

describe('RecursiveInnerTree', () => {
  it('initially renders an empty container and starts loading content', () => {
    const { listContents } = require('../../utils'); // eslint-disable-line global-require
    createSnapshot();

    expect(listContents).toHaveBeenCalledWith('/');
  });

  it('calls loadPath on mount', () => {
    const recursiveInnerTree = new RecursiveInnerTree(defaultProps);
    recursiveInnerTree.loadPath = jest.fn();
    recursiveInnerTree.componentDidMount();

    expect(recursiveInnerTree.loadPath).toHaveBeenCalledWith(defaultProps.path);
  });

  it('calls loadPath when a new path prop is received', () => {
    const recursiveInnerTree = new RecursiveInnerTree(defaultProps);
    recursiveInnerTree.loadPath = jest.fn();
    recursiveInnerTree.componentWillReceiveProps({ path: '/' });
    recursiveInnerTree.componentWillReceiveProps({ path: '/foo' });

    expect(recursiveInnerTree.loadPath).not.toHaveBeenCalledWith('/');
    expect(recursiveInnerTree.loadPath).toHaveBeenCalledWith('/foo');
  });

  it('clear loaded content for a directory if it is toggled off', () => {
    const recursiveInnerTree = new RecursiveInnerTree(defaultProps);
    const stopPropagation = jest.fn();
    recursiveInnerTree.setState = jest.fn();
    recursiveInnerTree.state = { '/home': true };
    recursiveInnerTree.toggleDirectory('/home')({ stopPropagation });

    expect(stopPropagation).toHaveBeenCalled();
    expect(recursiveInnerTree.setState).toHaveBeenCalledWith({ '/home': null });
  });

  it('opens a file with openFile', () => {
    const recursiveInnerTree = new RecursiveInnerTree(defaultProps);
    const stopPropagation = jest.fn();
    recursiveInnerTree.openFile('/file.txt')({ stopPropagation });

    expect(stopPropagation).toHaveBeenCalled();
  });
});
