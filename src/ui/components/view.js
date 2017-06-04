import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Line } from 'ui/components';

class View extends Component {
  static propTypes = {
    lines: PropTypes.array.isRequired,
  };

  render () {
    const { lines } = this.props;
    const lineNumberWidth = lines.length.toString().length;

    return (
      <div>
        {_.map(this.props.lines, (line, index) => (
          <Line
            key={index}
            number={_.padStart(index + 1, lineNumberWidth)}
            text={line}
          />
        ))}
      </div>
    );
  }
}

export default View;
