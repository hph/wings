import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Cursor } from 'ui/components';
import css from './styles.css';

const cx = classnames.bind(css);

class View extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
  };

  render () {
    const { config, view } = this.props;
    const numbersClasses = cx('numbers', { hidden: !config.showLineNumbers });
    return (
      <div className={css.root}>
        <div className={numbersClasses}>
          {_.map(view.lines, (line, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <div className={css.text}>
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
