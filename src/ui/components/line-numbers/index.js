import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';

import { charSizes, paneById } from 'ui/state/selectors';
import { updateConfig, updatePane } from 'ui/state/actions';
import css from './styles.css';

const cx = classnames.bind(css);

export class LineNumbers extends Component {
  onClickLine = ({ target }) => {
    const line = target.dataset.line || this.props.totalLines - 1;
    this.props.setActiveLine(parseInt(line, 10));
  };

  render() {
    const overlay = this.props.firstVisibleChar > 0;
    const classes = cx('root', this.props.className, { overlay });

    // We want to render at least one line and at most as many as are visible.
    const linesLeft = Math.max(
      1,
      this.props.totalLines - this.props.firstVisibleLine,
    );
    const count = Math.min(linesLeft, this.props.visibleLines);
    const range = [];
    for (let i = 0; i < count; i++) {
      range[i] = this.props.firstVisibleLine + i;
    }

    // Relative line numbers are zero-indexed (starting from the current line)
    // but are set to negative integers for columns above the current line.
    // This allows for unique keys but also means that, when used, we must
    // compute the absolute value (see return value).
    const numbers = this.props.relative
      ? range.map(n => [n, n - this.props.currentLine])
      : range.map(n => [n, n + 1]);

    return (
      <div
        className={classes}
        ref={this.props.innerRef}
        onMouseDown={this.onClickLine}
      >
        {numbers.map(([actualLine, displayedLine]) => (
          <div key={displayedLine} data-line={actualLine}>
            {Math.abs(displayedLine)}
          </div>
        ))}
      </div>
    );
  }
}

LineNumbers.propTypes = {
  className: PropTypes.string.isRequired,
  currentLine: PropTypes.number.isRequired,
  firstVisibleChar: PropTypes.number.isRequired,
  firstVisibleLine: PropTypes.number.isRequired,
  innerRef: PropTypes.func.isRequired,
  relative: PropTypes.bool.isRequired,
  setActiveLine: PropTypes.func.isRequired,
  totalLines: PropTypes.number.isRequired,
  visibleLines: PropTypes.number.isRequired,
};

export function mapStateToProps(state, props) {
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
    visibleLines: Math.ceil(pane.height / charHeight),
  };
}

export const setActiveLine = (row, paneId) => (dispatch, getState) => {
  if (getState().config.currentPaneId !== paneId) {
    dispatch(updateConfig({ currentPaneId: paneId }));
  }
  dispatch(updatePane(paneId, { row, column: 0 }));
};

export const mapDispatchToProps = (dispatch, { paneId }) => ({
  setActiveLine: row => dispatch(setActiveLine(row, paneId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LineNumbers);
