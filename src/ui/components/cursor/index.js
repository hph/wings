import React from 'react';
import classnames from 'classnames/bind';
import PropTypes from 'prop-types';

import css from './styles.css';

const cx = classnames.bind(css);

function Cursor ({ config, view }) {
  const classes = cx('root', { insertMode: config.mode === 'insert' });
  const styles = {
    left: view.column * config.charWidth,
    top: (view.row - view.firstVisibleRow) * config.charHeight,
  };
  return (
    <div className={classes} style={styles}>
      {view.lines[view.row][view.column]}
    </div>
  );
}

Cursor.propTypes = {
  config: PropTypes.object.isRequired,
  view: PropTypes.object.isRequired,
};

export default Cursor;
