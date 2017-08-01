import React from 'react';
import renderer from 'react-test-renderer';

import TitleBar from './index';

const defaultProps = {
  label: '',
};

const createSnapshot = (props = defaultProps) => {
  expect(
    renderer.create(<TitleBar {...props} />).toJSON(),
  ).toMatchSnapshot();
};

test('TitleBar renders a simple div with a class', () => {
  createSnapshot();
});

test('TitleBar renders a label inside it', () => {
  createSnapshot({ label: 'Wings is great!' });
});
