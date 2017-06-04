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
    this.state = {
      isTitleBarVisible: !this.windowIsFullscreen(),
    };
    setCustomProperties({ ...props.config.theme });
  }

  componentDidMount () {
    // Determine whether the titlebar should be shown or hidden on resize.
    window.addEventListener('resize', () => {
      this.showOrHideTitleBar(new Date().getTime());
    });
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.config.theme !== this.props.config.theme) {
      setCustomProperties({ ...nextProps.config.theme });
    }
  }

  windowIsFullscreen = () => {
    return window.innerHeight === window.screen.height;
  };

  showOrHideTitleBar = (start) => {
    const now = new Date().getTime();
    if (now - start > 150) {
      return;
    }

    const isTitleBarVisible = !this.windowIsFullscreen();
    if (isTitleBarVisible !== this.state.isTitleBarVisible) {
      this.setState({ isTitleBarVisible });
    }

    window.requestAnimationFrame(this.showOrHideTitleBar.bind(this, start));
  };

  render () {
    return (
      <div className={styles.root}>
        {this.state.isTitleBarVisible && <TitleBar label="Wings" />}
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
