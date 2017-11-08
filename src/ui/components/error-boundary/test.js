import React from 'react';
import renderer from 'react-test-renderer';

import ErrorBoundary from './index';

describe('ErrorBoundary', () => {
  const defaultProps = {
    info: 'Some info about where the error originated',
    message: 'The error message',
    type: 'Error type',
  };

  it('should render an error message with the provided props', () => {
    expect(
      renderer.create(<ErrorBoundary {...defaultProps} />).toJSON(),
    ).toMatchSnapshot();
  });
});
