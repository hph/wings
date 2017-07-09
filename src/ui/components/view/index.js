import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { actions } from 'ui/state';
import { Cursor } from 'ui/components';
import { updateView } from 'ui/state/actions';
import css from './styles.css';

const cx = classnames.bind(css);

class View extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    splits: PropTypes.number.isRequired,
    view: PropTypes.object.isRequired,
    viewId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
  };

  static mapStateToProps (state, props) {
    return {
      config: state.config,
      splits: state.views.length,
      view: _.find(state.views, view => view.id === props.viewId),
    };
  }

  componentDidMount () {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.splits !== this.props.splits) {
      setTimeout(this.onResize);
    }
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize);
  }

  onTextClick = (event) => {
    const { clientX, clientY, currentTarget, target } = event;
    const { config, dispatch, view } = this.props;

    const clickX = _.floor(_.max([0, clientX - currentTarget.offsetLeft]) / config.charWidth);
    const clickY = _.floor(_.max([0, clientY - currentTarget.offsetTop]) / config.charHeight);
    const numLines = _.max([0, view.lines.length - 1]);
    const row = currentTarget === target
      ? numLines + view.firstVisibleRow
      : _.min([numLines, clickY]) + view.firstVisibleRow;
    const offset = config.mode === 'insert' ? 0 : 1;
    const column = _.min([_.max([0, view.lines[row].length - offset]), clickX]);

    dispatch(actions.updateView(view.id, {
      column,
      row,
    }));

    if (config.currentViewId !== view.id) {
      dispatch(actions.updateConfig({ currentViewId: view.id }));
    }
  };

  onResize = _.throttle(() => {
    this.props.dispatch(updateView(this.props.view.id, {
      width: this.wrapperEl.offsetWidth - this.numbersEl.offsetWidth,
      height: this.textEl.offsetHeight,
    }));
  }, 16.7);

  render () {
    const { config, view, splits } = this.props;
    const numbersClasses = cx('numbers', {
      hidden: !config.showLineNumbers,
      overlay: view.firstVisibleColumn > 0,
    });
    const numLines = _.ceil(view.height / config.charHeight);
    const lines = _.slice(view.lines, view.firstVisibleRow, numLines + view.firstVisibleRow);
    let numbers = _.range(view.firstVisibleRow + 1, view.lines.length + 1);
    if (config.relativeLineNumbers) {
      numbers = _.map(numbers, number => Math.abs(number - 1 - view.row));
    }
    const textLeft = -view.firstVisibleColumn * config.charWidth;
    const wrapperStyles = {
      width: `${ 100 / splits }%`,
    };
    const rootClasses = cx('root', { overlay: splits > 0 });
    return (
      <div
        className={rootClasses}
        ref={node => this.wrapperEl = node}
        style={wrapperStyles}
      >
        <div className={numbersClasses} ref={node => this.numbersEl = node}>
          {_.map(numbers, (number, index) => <div key={index}>{number}</div>)}
        </div>
        <div
          className={css.text}
          ref={node => this.textEl = node}
          onMouseDown={this.onTextClick}
          style={{ left: textLeft }}
        >
          {_.map(lines, (line, index) => <div key={index}>{line}</div>)}
          {config.currentViewId === view.id && (
            <Cursor config={config} view={view} />
          )}
        </div>
      </div>
    );
  }
}

export default connect(View.mapStateToProps)(View);
