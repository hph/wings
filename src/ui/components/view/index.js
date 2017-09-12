import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Cursor, Line, LineNumbers } from 'ui/components';
import { updateConfig, updateView, userInputFocus } from 'ui/state/actions';
import css from './styles.css';

const cx = classnames.bind(css);

export class View extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    isFirst: PropTypes.bool.isRequired,
    splits: PropTypes.number.isRequired,
    updateConfig: PropTypes.func.isRequired,
    updateView: PropTypes.func.isRequired,
    userInputFocus: PropTypes.func.isRequired,
    view: PropTypes.object.isRequired,
    viewId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
  };

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
    const { config, view } = this.props;

    const clickX = _.floor(_.max([0, clientX - currentTarget.offsetLeft]) / config.charWidth);
    const clickY = _.floor(_.max([0, clientY - currentTarget.offsetTop]) / config.charHeight);

    // If the targets are the same then it means that the user
    // clicked below the last line in the view.
    const row = currentTarget === target
      ? _.max([0, view.lines.length - 1])
      : clickY + view.firstVisibleRow;

    const clickOffset = config.mode === 'insert' ? 1 : 0;
    const maxLengthOffset = config.mode === 'insert' ? 0 : -1;
    const column = _.min([
      _.max([0, view.lines[row].length + maxLengthOffset]),
      clickX + clickOffset,
    ]);

    this.props.updateView(view.id, { column, row });

    if (config.isBrowserVisible) {
      this.props.userInputFocus(true);
    }

    if (config.currentViewId !== view.id) {
      this.props.updateConfig({ currentViewId: view.id });
    }
  };

  onResize = _.throttle(() => {
    const numbersElWidth = this.numbersEl ? this.numbersEl.offsetWidth : 0;
    this.props.updateView(this.props.view.id, {
      width: this.wrapperEl.offsetWidth - numbersElWidth,
      height: this.textEl.offsetHeight,
    });
  }, 16.7);

  render () {
    const { config, isFirst, view, splits } = this.props;
    const textClasses = cx('text', {
      border: !config.showLineNumbers && !isFirst,
    });
    const numLines = _.ceil(view.height / config.charHeight);
    const lines = _.slice(view.lines, view.firstVisibleRow, numLines + view.firstVisibleRow);
    const textLeft = -view.firstVisibleColumn * config.charWidth;
    const wrapperStyles = {
      width: `${ 100 / splits }%`,
    };
    const rootClasses = cx('root', 'overlay');
    return (
      <div
        className={rootClasses}
        ref={node => this.wrapperEl = node}
        style={wrapperStyles}
      >
        {config.showLineNumbers && (
          <LineNumbers
            className={css.numbers}
            innerRef={node => this.numbersEl = node}
            config={config}
            view={view}
          />
        )}
        <div
          className={textClasses}
          ref={node => this.textEl = node}
          onMouseDown={this.onTextClick}
          style={{ left: textLeft }}
        >
          {_.map(lines, (line, index) => (
            <Line
              key={index}
              row={index + view.firstVisibleRow}
              selectionColumnEnd={view.selectionColumnEnd}
              selectionColumnStart={view.selectionColumnStart}
              selectionRowEnd={view.selectionRowEnd}
              selectionRowStart={view.selectionRowStart}
            >{line}</Line>
          ))}
          {config.currentViewId === view.id && (
            <Cursor config={config} view={view} />
          )}
        </div>
      </div>
    );
  }
}

export function mapStateToProps (state, props) {
  return {
    config: state.config,
    splits: state.views.length,
    view: _.find(state.views, view => view.id === props.viewId),
  };
}

export default connect(mapStateToProps, { updateConfig, updateView, userInputFocus })(View);
