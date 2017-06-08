import React, { Component } from 'react';
import PropTypes from 'prop-types';

import css from './styles.css';

class TitleBar extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
  };

  render () {
    return <div className={css.root}>{this.props.label}</div>;
  }
}

export default TitleBar;
