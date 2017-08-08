import React from 'react';
import renderer from 'react-test-renderer';

import Logo from './index';

test('Logo renders an SVG logo', () => {
  expect(renderer.create(<Logo />).toJSON()).toMatchSnapshot();
});
