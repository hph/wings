import React from 'react';
import PropTypes from 'prop-types';

import css from './styles.css';

const Token = ({ children, type }) => (
  <span className={css[type]}>{children}</span>
);

Token.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.string, // eslint-disable-line react/require-default-props
};

export default Token;
