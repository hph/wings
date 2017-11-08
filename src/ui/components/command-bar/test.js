import React from 'react';
import renderer from 'react-test-renderer';

import { CommandBar, mapStateToProps } from './index';

const defaultProps = {
  command: '',
};

const createSnapshot = (props = defaultProps) => {
  expect(renderer.create(<CommandBar {...props} />).toJSON()).toMatchSnapshot();
};

describe('CommandBar', () => {
  it('renders an empty command bar', () => {
    createSnapshot();
  });

  it('renders a command bar with the provided command', () => {
    createSnapshot({ command: 'foo' });
  });

  it('uses the command prop from the store', () => {
    const command = 'something';
    expect(mapStateToProps({ command })).toEqual({ command });
  });
});
