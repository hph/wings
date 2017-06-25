import React from 'react';
import PropTypes from 'prop-types';

import css from './styles.css';

function TitleBar ({ label }) {
  return <div className={css.root}>{label}</div>;
}

TitleBar.propTypes = {
  label: PropTypes.string.isRequired,
};

export default TitleBar;
