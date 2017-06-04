import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './styles.css';

class Line extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
  };

  render () {
    return (
      <div className={styles.root}>
        <div className={styles.number}>
          {this.props.number}
        </div>
        <div>
          {this.props.text}
        </div>
      </div>
    );
  }
}

export default Line;
