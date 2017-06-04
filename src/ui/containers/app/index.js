import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import styles from './styles.css';

class App extends Component {

  static propTypes = {
    views: PropTypes.array.isRequired,
  };

  static mapStateToProps (state) {
    return {
      views: state.views,
    };
  }

  render () {
    return (
      <div className={styles.root}>
        {_.isEmpty(this.props.views) ? (
          'Pass a filename as an argument to render it here'
        ) : (
          _.map(this.props.views[0].lines, (line, index) => (
            <div key={index}>{line}</div>
          ))
        )}
      </div>
    );
  }

}

export default connect(App.mapStateToProps)(App);
