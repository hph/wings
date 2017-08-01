import React from 'react';
import classnames from 'classnames/bind';
import PropTypes from 'prop-types';
import _ from 'lodash';

import css from './styles.css';

const cx = classnames.bind(css);

function LineNumbers ({ className, config, view }) {
  const classes = cx('root', className, {
    overlay: view.firstVisibleColumn > 0,
  });
  let numbers = _.range(view.firstVisibleRow + 1, view.lines.length + 1);
  if (config.relativeLineNumbers) {
    numbers = _.map(numbers, number => number - 1 - view.row);
  }
  return (
    <div className={classes}>
      {_.map(numbers, number => <div key={number}>{Math.abs(number)}</div>)}
    </div>
  );
}

LineNumbers.propTypes = {
  className: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  view: PropTypes.object.isRequired,
};

export default LineNumbers;
