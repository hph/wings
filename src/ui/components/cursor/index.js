import React from 'react';
import classnames from 'classnames/bind';
import PropTypes from 'prop-types';

import css from './styles.css';

const cx = classnames.bind(css);

function Cursor ({ config, view }) {
  const insertMode = config.mode === 'insert';
  const pulsate = insertMode && !config.isUserTyping;
  const classes = cx('root', { insertMode, pulsate });
  const styles = {
    left: view.column * config.charWidth,
    top: (view.row - view.firstVisibleRow) * config.charHeight,
  };
  return (
    <div className={classes} style={styles}>
      {!insertMode && view.lines[view.row][view.column]}
    </div>
  );
}

Cursor.propTypes = {
  config: PropTypes.object.isRequired,
  view: PropTypes.object.isRequired,
};

export default Cursor;
