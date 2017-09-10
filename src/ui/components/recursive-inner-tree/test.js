import React from 'react';
import renderer from 'react-test-renderer';

import { RecursiveInnerTree } from './index';

jest.mock('fs-extra', () => ({
  readFile: jest.fn(() => Promise.resolve('text')),
}));

jest.mock('../../utils', () => ({
  listContents: jest.fn(() => Promise.resolve('<results>')),
}));

const defaultProps = {
  path: '/',
  createView: jest.fn(),
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

  it('renders a set of dirctories and files', () => {
    const props = {
      ...defaultProps,
      directories: ['/foo'],
      files: ['bar.txt', 'baz.txt'],
    };
    const component = renderer.create(<RecursiveInnerTree {...props} />);
    const instance = component.getInstance();
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    const stopPropagation = jest.fn();
    return instance.toggleDirectory('/foo')({ stopPropagation })
      .then(() => {
        expect(stopPropagation).toHaveBeenCalled();
        tree = component.toJSON();
        expect(tree).toMatchSnapshot();
      });
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

  it('should clear loaded content for a directory if it is toggled off', () => {
    const recursiveInnerTree = new RecursiveInnerTree(defaultProps);
    const stopPropagation = jest.fn();
    recursiveInnerTree.setState = jest.fn();
    recursiveInnerTree.state = { '/home': true };
    recursiveInnerTree.toggleDirectory('/home')({ stopPropagation });

    expect(stopPropagation).toHaveBeenCalled();
    expect(recursiveInnerTree.setState).toHaveBeenCalledWith({ '/home': null });
  });

  it('should load directory contents when clicking on the name', () => {
    const { listContents } = require('../../utils'); // eslint-disable-line global-require
    const recursiveInnerTree = new RecursiveInnerTree(defaultProps);
    const stopPropagation = jest.fn();
    recursiveInnerTree.setState = jest.fn();
    recursiveInnerTree.state = {};
    return recursiveInnerTree.toggleDirectory('/home')({ stopPropagation })
      .then(() => {
        expect(stopPropagation).toHaveBeenCalled();
        expect(listContents).toHaveBeenCalledWith('/home');
        expect(recursiveInnerTree.setState).toHaveBeenCalledWith({ '/home': '<results>' });
      });
  });

  it('opens a file with openFile', () => {
    const { readFile } = require('fs-extra'); // eslint-disable-line global-require
    const createView = jest.fn();
    const recursiveInnerTree = new RecursiveInnerTree({
      ...defaultProps,
      createView,
    });
    const stopPropagation = jest.fn();
    return recursiveInnerTree.openFile('/file.txt')({ stopPropagation })
      .then(() => {
        expect(stopPropagation).toHaveBeenCalled();
        expect(readFile).toHaveBeenCalled();
        expect(createView).toHaveBeenCalled();
        expect(createView).toHaveBeenCalledWith('/file.txt', 'text');
      });
  });
});
