import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { actions } from 'ui/state';
import { Cursor } from 'ui/components';
import css from './styles.css';

const cx = classnames.bind(css);

class View extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    view: PropTypes.object.isRequired,
  };

  onTextClick = (event) => {
    const { clientX, clientY, currentTarget, target } = event;
    const { config, dispatch, view } = this.props;

    const clickX = _.floor(_.max([0, clientX - currentTarget.offsetLeft]) / config.charWidth);
    const clickY = _.floor(_.max([0, clientY - currentTarget.offsetTop]) / config.charHeight);
    const numLines = _.max([0, view.lines.length - 1]);
    const row = currentTarget === target ? numLines : _.min([numLines, clickY]);
    const offset = config.mode === 'insert' ? 0 : 1;
    const column = _.min([_.max([0, view.lines[row].length - offset]), clickX]);

    dispatch(actions.updateView(view.id, {
      column,
      row,
    }));
  };

  render () {
    const { config, view } = this.props;
    const numbersClasses = cx('numbers', { hidden: !config.showLineNumbers });
    let numbers = _.range(1, view.lines.length + 1);
    if (config.relativeLineNumbers) {
      numbers = _.map(numbers, number => Math.abs(number - 1 - view.row));
    }
    return (
      <div className={css.root}>
        <div className={numbersClasses}>
          {_.map(numbers, (number, index) => (
            <div key={index}>{number}</div>
          ))}
        </div>
        <div className={css.text} onMouseDown={this.onTextClick}>
          {_.map(view.lines, (line, index) => (
            <div key={index}>{line}</div>
          ))}
          <Cursor config={config} view={view} />
        </div>
      </div>
    );
  }
}

export default View;
