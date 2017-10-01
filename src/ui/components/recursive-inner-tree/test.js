import React from 'react';
import renderer from 'react-test-renderer';

import { RecursiveInnerTree } from './index';

jest.mock('fs-extra', () => ({
  readFile: jest.fn(() => Promise.resolve('text')),
}));

jest.mock('../../utils', () => ({
  listContents: jest.fn(() => Promise.resolve('<results>')),
}));

describe('RecursiveInnerTree', () => {
  const defaultProps = {
    path: '/',
    createPane: jest.fn(),
  };

  it('initially renders an empty container and starts loading content', () => {
    // eslint-disable-next-line global-require
    const { listContents } = require('../../utils');

    expect(
      renderer.create(<RecursiveInnerTree {...defaultProps} />).toJSON(),
    ).toMatchSnapshot();

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
    // eslint-disable-next-line global-require
    const { listContents } = require('../../utils');

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
    // eslint-disable-next-line global-require
    const { readFile } = require('fs-extra');

    const createPane = jest.fn();
    const recursiveInnerTree = new RecursiveInnerTree({
      ...defaultProps,
      createPane,
    });
    const stopPropagation = jest.fn();
    return recursiveInnerTree.openFile('/file.txt')({ stopPropagation })
      .then(() => {
        expect(stopPropagation).toHaveBeenCalled();
        expect(readFile).toHaveBeenCalled();
        expect(createPane).toHaveBeenCalled();
        expect(createPane).toHaveBeenCalledWith('/file.txt', 'text');
      });
  });
});
