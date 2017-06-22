import _ from 'lodash';
import React, { Component } from 'react';
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
    view: PropTypes.object.isRequired,
  };

  componentDidMount () {
    window.addEventListener('resize', this.onResize);
    this.onResize();
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
  };

  onResize = _.throttle(() => {
    this.props.dispatch(updateView(this.props.view.id, {
      width: window.innerWidth - this.numbersEl.offsetWidth,
      height: this.textEl.offsetHeight,
    }));
  }, 16.7);

  render () {
    const { config, view } = this.props;
    const numbersClasses = cx('numbers', { hidden: !config.showLineNumbers });
    const numLines = _.ceil(view.height / config.charHeight);
    const lines = _.slice(view.lines, view.firstVisibleRow, numLines + view.firstVisibleRow);
    let numbers = _.range(view.firstVisibleRow + 1, view.lines.length + 1);
    if (config.relativeLineNumbers) {
      numbers = _.map(numbers, number => Math.abs(number - 1 - view.row));
    }
    const textLeft = -view.firstVisibleColumn * config.charWidth;
    return (
      <div className={css.root}>
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
          <Cursor config={config} view={view} />
        </div>
      </div>
    );
  }
}

export default View;
