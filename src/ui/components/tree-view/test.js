import React from 'react';
import renderer from 'react-test-renderer';

import { TreeView, mapStateToProps } from './index';

jest.mock('../recursive-inner-tree', () => 'RecursiveInnerTree');

const defaultProps = {
  config: {
    cwd: '~/Code',
  },
};

const createSnapshot = (props = defaultProps) => {
  expect(
    renderer.create(<TreeView {...props} />).toJSON(),
  ).toMatchSnapshot();
};

describe('TreeView', () => {
  it('renders a basic wrapper around RecursiveInnerTree', () => {
    createSnapshot();
  });

  it('does not have a postfix in the / directory', () => {
    createSnapshot({
      ...defaultProps,
      config: {
        cwd: '/',
      },
    });
  });

  describe('mapStateToProps', () => {
    it('returns config from the store', () => {
      expect(mapStateToProps({ config: {} })).toEqual({
        config: {},
      });
    });
  });
});
