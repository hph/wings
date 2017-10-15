import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import _ from 'lodash';

import { charSizes, paneById } from 'ui/state/selectors';
import css from './styles.css';

const cx = classnames.bind(css);

export function LineNumbers (props) {
  const overlay = props.firstVisibleChar > 0;
  const classes = cx('root', props.className, { overlay });

  // We want to render at least one line and at most as many as are visible.
  const linesLeft = _.max([1, props.totalLines - props.firstVisibleLine]);
  const count = _.min([linesLeft, props.visibleLines]);

  let numbers = _.range(props.firstVisibleLine + 1, count + props.firstVisibleLine + 1);
  if (props.relative) {
    // Relative line numbers are zero-indexed (starting from the current line)
    // but are set to negative integers for columns above the current line.
    // This allows for unique keys but also means that, when used, we must
    // compute the absolute value (see return value).
    numbers = _.map(numbers, number => number - props.currentLine - 1);
  }

  return (
    <div className={classes} ref={props.innerRef}>
      {_.map(numbers, number => <div key={number}>{Math.abs(number)}</div>)}
    </div>
  );
}

LineNumbers.propTypes = {
  className: PropTypes.string.isRequired,
  currentLine: PropTypes.number.isRequired,
  firstVisibleChar: PropTypes.number.isRequired,
  firstVisibleLine: PropTypes.number.isRequired,
  innerRef: PropTypes.func.isRequired,
  relative: PropTypes.bool.isRequired,
  totalLines: PropTypes.number.isRequired,
  visibleLines: PropTypes.number.isRequired,
};

export function mapStateToProps (state, props) {
  const pane = paneById(state, props);
  const { charHeight } = charSizes(state);
  return {
    className: props.className,
    currentLine: pane.row,
    firstVisibleChar: pane.firstVisibleColumn,
    firstVisibleLine: pane.firstVisibleRow,
    innerRef: props.innerRef,
    relative: state.config.relativeLineNumbers,
    totalLines: pane.lines.length,
    visibleLines: _.ceil(pane.height / charHeight),
  };
}

export default connect(mapStateToProps)(LineNumbers);
