import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import setCustomProperties from 'dynamic-css-properties';

import { TitleBar, View } from 'ui/components';
import { updateConfig } from 'ui/state/actions';
import css from './styles.css';

class App extends Component {

  static propTypes = {
    config: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
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
    if (isTitleBarVisible !== this.props.config.isTitleBarVisible) {
      this.props.dispatch(updateConfig({ isTitleBarVisible }));
    }

    window.requestAnimationFrame(this.showOrHideTitleBar.bind(this, start));
  };

  render () {
    const { config, dispatch, views } = this.props;
    return (
      <div className={css.root}>
        {config.isTitleBarVisible && <TitleBar label="Wings" />}
        {_.isEmpty(views) ? (
          'Pass a filename as an argument to render it here'
        ) : (
          <View config={config} dispatch={dispatch} view={views[0]} />
        )}
      </div>
    );
  }

}

export default connect(App.mapStateToProps)(App);
