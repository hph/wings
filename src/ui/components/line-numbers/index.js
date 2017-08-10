import React, { Component } from 'react';
import classnames from 'classnames/bind';
import PropTypes from 'prop-types';
import _ from 'lodash';

import css from './styles.css';

const cx = classnames.bind(css);

class LineNumbers extends Component {
  static propTypes = {
    className: PropTypes.string.isRequired,
    config: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
  };

  shouldComponentUpdate (nextProps) {
    const { className, config, view } = this.props;
    if (
      className !== nextProps.className ||
      config.charHeight !== nextProps.config.charHeight ||
      config.relativeLineNumbers !== nextProps.config.relativeLineNumbers ||
      view.firstVisibleRow !== nextProps.view.firstVisibleRow ||
      view.height !== nextProps.view.height ||
      view.lines.length !== nextProps.view.lines.length ||
      view.row !== nextProps.view.row
    ) {
      return true;
    }

    return false;
  }

  render () {
    const { className, config, view } = this.props;
    const classes = cx('root', className, {
      overlay: view.firstVisibleColumn > 0,
    });
    const numLines = _.min([
      _.ceil(view.height / config.charHeight),
      view.lines.length - view.firstVisibleRow || 1],
    );
    let numbers = _.range(view.firstVisibleRow + 1, numLines + view.firstVisibleRow + 1);
    if (config.relativeLineNumbers) {
      numbers = _.map(numbers, number => number - 1 - view.row);
    }
    return (
      <div className={classes}>
        {_.map(numbers, number => <div key={number}>{Math.abs(number)}</div>)}
      </div>
    );
  }
}

export default LineNumbers;
