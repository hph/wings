import React from 'react';
import { render } from 'react-dom';

import { Root } from 'ui/components';

jest.mock('react-dom', () => ({
  render: jest.fn(),
}));

jest.mock('ui/components/root', () => 'Root');

describe('ui entry point', () => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  it('should render the app as a side effect of importing the module', () => {
    expect(render).not.toHaveBeenCalled();

    require('./index'); // eslint-disable-line global-require

    expect(render).toHaveBeenCalledWith(<Root />, container);
  });
});
