import React from 'react';
import PropTypes from 'prop-types';

import css from './styles.css';

export default function Line ({
  children,
  row,
  selectionColumnEnd,
  selectionColumnStart,
  selectionRowEnd,
  selectionRowStart,
}) {
  if (selectionRowStart <= row && row <= selectionRowEnd) {
    const start = selectionRowStart < row ? 0 : selectionColumnStart;
    const end = selectionRowEnd > row ? children.length - 1 : selectionColumnEnd;
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
  selectionColumnEnd: PropTypes.number, // eslint-disable-line react/require-default-props
  selectionColumnStart: PropTypes.number, // eslint-disable-line react/require-default-props
  selectionRowEnd: PropTypes.number, // eslint-disable-line react/require-default-props
  selectionRowStart: PropTypes.number, // eslint-disable-line react/require-default-props
};
