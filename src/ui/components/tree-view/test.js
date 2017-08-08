import React from 'react';
import renderer from 'react-test-renderer';

import { TreeView } from './index';

jest.mock('../recursive-inner-tree', () => 'RecursiveInnerTree');

const defaultProps = {
  config: {
    cwd: '~/Code',
  },
  dispatch: () => {},
};

const createSnapshot = (props = defaultProps) => {
  expect(
    renderer.create(<TreeView {...props} />).toJSON(),
  ).toMatchSnapshot();
};

test('TreeView renders a basic wrapper around RecursiveInnerTree', () => {
  createSnapshot();
});
