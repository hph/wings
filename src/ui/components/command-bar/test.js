import React from 'react';
import renderer from 'react-test-renderer';

import { CommandBar } from './index';

const defaultProps = {
  command: '',
};

const createSnapshot = (props = defaultProps) => {
  expect(
    renderer.create(<CommandBar {...props} />).toJSON(),
  ).toMatchSnapshot();
};

test('CommandBar renders an empty command bar', () => {
  createSnapshot();
});

test('CommandBar renders a command bar with the provided command', () => {
  createSnapshot({ command: 'foo' });
});
