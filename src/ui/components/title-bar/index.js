import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import css from './styles.css';

class TitleBar extends PureComponent {
  static propTypes = {
    label: PropTypes.string.isRequired,
  };

  render () {
    return <div className={css.root}>{this.props.label}</div>;
  }
}

export default TitleBar;
