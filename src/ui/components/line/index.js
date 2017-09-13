import React from 'react';
import PropTypes from 'prop-types';

import css from './styles.css';

export default function Line ({ children, row, selection }) {
  const { columnEnd, columnStart, rowEnd, rowStart } = selection;
  if (rowStart <= row && row <= rowEnd) {
    const start = rowStart < row ? 0 : columnStart;
    const end = rowEnd > row ? children.length - 1 : columnEnd;
    return (
      <div>
        {children.substring(0, start) || null}
        <div className={css.selection}>{children.substring(start, end + 1)}</div>
        {children.substring(end + 1) || null}
      </div>
    );
  }

  return <div>{children}</div>;
}

Line.propTypes = {
  children: PropTypes.string.isRequired,
  row: PropTypes.number.isRequired,
  selection: PropTypes.object,
};

Line.defaultProps = {
  selection: {},
};
