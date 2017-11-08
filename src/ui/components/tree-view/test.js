import React from 'react';
import renderer from 'react-test-renderer';

import { TreeView, mapStateToProps } from './index';

jest.mock('../recursive-inner-tree', () => 'RecursiveInnerTree');

describe('TreeView', () => {
  const createSnapshot = passedProps => {
    const props = {
      cwd: '~/Code',
      ...passedProps,
    };
    expect(renderer.create(<TreeView {...props} />).toJSON()).toMatchSnapshot();
  };

  it('should render a basic wrapper around RecursiveInnerTree', () => {
    createSnapshot();
  });

  it('should not have a postfix in the / directory', () => {
    createSnapshot({ cwd: '/' });
  });
});

describe('TreeView mapStateToProps', () => {
  it('should return cwd from the state', () => {
    const config = { cwd: '/foo' };

    expect(mapStateToProps({ config })).toEqual(config);
  });
});
