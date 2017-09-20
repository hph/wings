import React from 'react';
import renderer from 'react-test-renderer';

import Logo from './index';

describe('Logo', () => {
  it('should render an SVG logo', () => {
    expect(renderer.create(<Logo />).toJSON()).toMatchSnapshot();
  });
});
