import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import css from './styles.css';

export default class TitleBar extends PureComponent {
  render () {
    return <div className={css.root}>{this.props.label}</div>;
  }
}

TitleBar.propTypes = {
  label: PropTypes.string.isRequired,
};
