import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import setCustomProperties from 'dynamic-css-properties';

import { TitleBar } from 'ui/components';
import styles from './styles.css';

class App extends Component {

  static propTypes = {
    config: PropTypes.object.isRequired,
    views: PropTypes.array.isRequired,
  };

  static mapStateToProps (state) {
    return {
      config: state.config,
      views: state.views,
    };
  }

  constructor (props) {
    super(props);
    setCustomProperties({ ...props.config.theme });
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.config.theme !== this.props.config.theme) {
      setCustomProperties({ ...nextProps.config.theme });
    }
  }

  render () {
    return (
      <div className={styles.root}>
        <TitleBar label="Wings" />
        <div>
          {_.isEmpty(this.props.views) ? (
            'Pass a filename as an argument to render it here'
          ) : (
            _.map(this.props.views[0].lines, (line, index) => (
              <div key={index}>{line}</div>
            ))
          )}
        </div>
      </div>
    );
  }

}

export default connect(App.mapStateToProps)(App);
