import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { RecursiveInnerTree } from 'ui/components';
import { collapsePath } from 'ui/utils';
import css from './styles.css';

export function TreeView ({ cwd }) {
  const postfix = cwd === '/' ? '' : '/';
  const qualifiedCwd = `${ collapsePath(cwd) }${ postfix }`;
  return (
    <div className={css.root}>
      <div className={css.path} title={qualifiedCwd}>
        {qualifiedCwd}
      </div>
      <div className={css.scrollWrapper}>
        <RecursiveInnerTree path={cwd} />
      </div>
    </div>
  );
}

TreeView.propTypes = {
  cwd: PropTypes.string.isRequired,
};

export function mapStateToProps ({ config }) {
  return {
    cwd: config.cwd,
  };
}

export default connect(mapStateToProps)(TreeView);
