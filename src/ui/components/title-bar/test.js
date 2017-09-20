import React, { PureComponent } from 'react';
import renderer from 'react-test-renderer';

import TitleBar from './index';

describe('TitleBar', () => {
  const createSnapshot = (passedProps = {}) => {
    const props = {
      label: '',
      ...passedProps,
    };
    expect(renderer.create(<TitleBar {...props} />).toJSON()).toMatchSnapshot();
  };

  it('should render a simple div with a class', () => {
    createSnapshot();
  });

  it('should render a label inside it', () => {
    createSnapshot({ label: 'Wings is great!' });
  });

  it('should extend PureComponent since it is not connected', () => {
    expect(TitleBar.prototype).toBeInstanceOf(PureComponent);
  });
});
