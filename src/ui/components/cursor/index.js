import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import PropTypes from 'prop-types';

import { charSizes, paneById } from 'ui/state/selectors';
import css from './styles.css';

const cx = classnames.bind(css);

export function Cursor (props) {
  const { block, character, top, left } = props;
  const pulsate = props.pulsate && !block;
  const classes = cx('root', { block, pulsate });
  const styles = { top, left };
  return <div className={classes} style={styles}>{character}</div>;
}

Cursor.propTypes = {
  block: PropTypes.bool.isRequired,
  character: PropTypes.string.isRequired,
  left: PropTypes.number.isRequired,
  pulsate: PropTypes.bool.isRequired,
  top: PropTypes.number.isRequired,
};

export function mapStateToProps (state, props) {
  const { config } = state;
  const pane = paneById(state, props);
  const block = config.mode !== 'insert';
  const { charHeight, charWidth } = charSizes(state);
  return {
    block,
    character: block ? pane.lines[pane.row][pane.column] || ' ' : '',
    left: pane.column * charWidth,
    pulsate: !config.isUserTyping,
    top: (pane.row - pane.firstVisibleRow) * charHeight,
  };
}

export default connect(mapStateToProps)(Cursor);
