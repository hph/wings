import React from 'react';
import renderer from 'react-test-renderer';

import Token from './index';

describe('Token', () => {
  it('should render children in a span', () => {
    expect(renderer.create(<Token>token</Token>).toJSON()).toMatchSnapshot();
  });

  it('should set a className prop based on the type', () => {
    expect(
      renderer.create(<Token type="comment">token</Token>).toJSON(),
    ).toMatchSnapshot();
  });
});
