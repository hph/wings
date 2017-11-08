import React from 'react';
import PropTypes from 'prop-types';

import css from './styles.css';

const ErrorBoundary = ({ info, message, type }) => (
  <div className={css.root}>
    <div className={css.type}>{type}</div>
    <div>{message}</div>
    <div className={css.info}>{info}</div>
  </div>
);

ErrorBoundary.propTypes = {
  info: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default ErrorBoundary;
