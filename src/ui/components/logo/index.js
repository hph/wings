import React from 'react';

import svg from 'assets/W.svg';
import css from './styles.css';

/* eslint-disable react/no-danger */
export default function Logo () {
  return (
    <div className={css.root} dangerouslySetInnerHTML={{ __html: svg }} />
  );
}
/* eslint-enable react/no-danger */
