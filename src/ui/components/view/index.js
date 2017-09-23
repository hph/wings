import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Cursor, LineNumbers } from 'ui/components';
import { updateConfig, updateView, userInputFocus } from 'ui/state/actions';
import { viewById } from 'ui/state/selectors';
import css from './styles.css';

const cx = classnames.bind(css);

export class View extends Component {
  componentDidMount () {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.splits !== this.props.splits) {
      this.onResize();
    }
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize);
  }

  onTextClick = (event) => {
    const { clientX, clientY, currentTarget, target } = event;
    const { charWidth, charHeight, firstVisibleRow, lines, viewId, mode } = this.props;

    const clickX = _.floor(_.max([0, clientX - currentTarget.offsetLeft]) / charWidth);
    const clickY = _.floor(_.max([0, clientY - currentTarget.offsetTop]) / charHeight);

    // If the targets are the same then it means that the user
    // clicked below the last line in the view.
    const row = currentTarget === target
      ? _.max([0, lines.length - 1])
      : clickY + firstVisibleRow;

    const maxLengthOffset = mode === 'insert' ? 0 : -1;
    const column = _.min([
      _.max([0, lines[row].length + maxLengthOffset]),
      clickX,
    ]);

    this.props.updateView(viewId, { column, row });

    if (this.props.isBrowserVisible) {
      this.props.userInputFocus(true);
    }

    if (this.props.currentViewId !== viewId) {
      this.props.updateConfig({ currentViewId: viewId });
    }
  };

  onResize = _.throttle(() => {
    const numbersElWidth = this.numbersEl ? this.numbersEl.offsetWidth : 0;
    this.props.updateView(this.props.viewId, {
      width: this.wrapperEl.offsetWidth - numbersElWidth,
      height: this.textEl.offsetHeight,
    });
  }, 16.7);

  wrapperRef = node => this.wrapperEl = node;

  numbersRef = node => this.numbersEl = node;

  render () {
    const rootClasses = cx('root', 'overlay');
    const textClasses = cx('text', {
      border: !this.props.showLineNumbers && !this.props.isFirst,
    });
    const textLeft = -this.props.firstVisibleColumn * this.props.charWidth;
    const wrapperStyles = {
      width: `${ 100 / this.props.splits }%`,
    };

    const numLines = _.ceil(this.props.height / this.props.charHeight);
    const lines = _.slice(
      this.props.lines,
      this.props.firstVisibleRow,
      numLines + this.props.firstVisibleRow,
    );

    return (
      <div
        className={rootClasses}
        ref={this.wrapperRef}
        style={wrapperStyles}
      >
        {this.props.showLineNumbers && (
          <LineNumbers
            className={css.numbers}
            innerRef={this.numbersRef}
            viewId={this.props.viewId}
          />
        )}
        <div
          className={textClasses}
          ref={node => this.textEl = node}
          onMouseDown={this.onTextClick}
          style={{ left: textLeft }}
        >
          {_.map(lines, (line, index) => <div key={index}>{line}</div>)}
          {this.props.currentViewId === this.props.viewId && (
            <Cursor viewId={this.props.viewId} />
          )}
        </div>
      </div>
    );
  }
}

View.propTypes = {
  charHeight: PropTypes.number.isRequired,
  charWidth: PropTypes.number.isRequired,
  currentViewId: PropTypes.number.isRequired,
  firstVisibleColumn: PropTypes.number.isRequired,
  firstVisibleRow: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  isBrowserVisible: PropTypes.bool.isRequired,
  isFirst: PropTypes.bool.isRequired,
  lines: PropTypes.arrayOf(PropTypes.string).isRequired,
  mode: PropTypes.string.isRequired,
  showLineNumbers: PropTypes.bool.isRequired,
  splits: PropTypes.number.isRequired,
  updateConfig: PropTypes.func.isRequired,
  updateView: PropTypes.func.isRequired,
  userInputFocus: PropTypes.func.isRequired,
  viewId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
};

export function mapStateToProps (state, props) {
  const view = viewById(state, props);
  return {
    charHeight: state.config.charHeight,
    charWidth: state.config.charWidth,
    column: view.column,
    currentViewId: state.config.currentViewId,
    firstVisibleColumn: view.firstVisibleColumn,
    firstVisibleRow: view.firstVisibleRow,
    height: view.height,
    isBrowserVisible: state.config.isBrowserVisible,
    lines: view.lines,
    mode: state.config.mode,
    showLineNumbers: state.config.showLineNumbers,
    splits: state.views.length,
    viewId: props.viewId,
  };
}

export default connect(mapStateToProps, { updateConfig, updateView, userInputFocus })(View);
