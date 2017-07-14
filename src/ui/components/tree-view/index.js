import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { RecursiveInnerTree } from 'ui/components';
import css from './styles.css';

function TreeView ({ dispatch }) {
  const cwd = process.cwd();
  const qualifiedCwd = `${ cwd.replace(process.env.HOME, '~') }/`;
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
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps () {
  return {};
}

export default connect(mapStateToProps)(TreeView);
