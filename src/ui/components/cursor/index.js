import React, { Component } from 'react';
import classnames from 'classnames/bind';
import PropTypes from 'prop-types';

import css from './styles.css';

const cx = classnames.bind(css);

class Cursor extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
  };

  render () {
    const { config, view } = this.props;
    const character = view.lines[view.row][view.column] || ' ';

    const classes = cx('root', { insertMode: config.mode === 'insert' });
    const styles = {
      left: view.column * config.charWidth,
      top: (view.row - view.firstVisibleRow) * config.charHeight,
    };

    return (
      <div className={classes} ref={el => this.el = el} style={styles}>
        {config.mode === 'normal' ? character : null}
      </div>
    );
  }
}

export default Cursor;
