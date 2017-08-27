import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { RecursiveInnerTree } from 'ui/components';
import { collapsePath } from 'ui/utils';
import css from './styles.css';

export function TreeView ({ config, dispatch }) {
  const { cwd } = config;
  const postfix = cwd === '/' ? '' : '/';
  const qualifiedCwd = `${ collapsePath(cwd) }${ postfix }`;
  return (
    <div className={css.root}>
      <div className={css.path} title={qualifiedCwd}>
        {qualifiedCwd}
      </div>
      <div className={css.scrollWrapper}>
        <RecursiveInnerTree path={cwd} dispatch={dispatch} />
      </div>
    </div>
  );
}

TreeView.propTypes = {
  config: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export function mapStateToProps ({ config }) {
  return { config };
}

export default connect(mapStateToProps)(TreeView);
