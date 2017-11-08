import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import PropTypes from 'prop-types';

import { charSizes, paneById } from 'ui/state/selectors';
import css from './styles.css';

const cx = classnames.bind(css);

export function Cursor(props) {
  const { abscissa, block, character, ordinate } = props;
  const pulsate = props.pulsate && !block;
  const classes = cx('root', { block, pulsate });
  const styles = {
    WebkitTransform: `translate3d(${abscissa}px, ${ordinate}px, 0)`,
  };
  return (
    <div className={classes} style={styles}>
      {character}
    </div>
  );
}

Cursor.propTypes = {
  abscissa: PropTypes.number.isRequired,
  block: PropTypes.bool.isRequired,
  character: PropTypes.string.isRequired,
  ordinate: PropTypes.number.isRequired,
  pulsate: PropTypes.bool.isRequired,
};

export function mapStateToProps(state, props) {
  const { config } = state;
  const pane = paneById(state, props);
  const block = config.mode !== 'insert';
  const { charHeight, charWidth } = charSizes(state);
  return {
    block,
    abscissa: pane.column * charWidth,
    character: block ? pane.lines[pane.row][pane.column] || ' ' : '',
    ordinate: (pane.row - pane.firstVisibleRow) * charHeight,
    pulsate: !config.isUserTyping,
  };
}

export default connect(mapStateToProps)(Cursor);
