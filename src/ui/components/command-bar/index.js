import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import css from './styles.css';

export function CommandBar ({ command }) {
  return (
    <div className={css.root}>
      <div className={css.container}>
        <div className={css.colon}>:</div>
        <div>{command}</div>
        <div className={css.caret} />
      </div>
    </div>
  );
}

CommandBar.propTypes = {
  command: PropTypes.string.isRequired,
};

export function mapStateToProps ({ command }) {
  return { command };
}

export default connect(mapStateToProps)(CommandBar);
