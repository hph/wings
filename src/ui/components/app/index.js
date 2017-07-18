import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import setCustomProperties from 'dynamic-css-properties';

import { Browser, CommandBar, TitleBar, TreeView, View } from 'ui/components';
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
    this.setCustomProperties(props.config);
  }

  componentDidMount () {
    // Determine whether the titlebar should be shown or hidden on resize.
    window.addEventListener('resize', () => {
      this.showOrHideTitleBar(new Date().getTime());
    });
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.config.theme !== this.props.config.theme) {
      this.setCustomProperties(nextProps.config);
    }
  }

  setCustomProperties (config) {
    setCustomProperties({
      ...config.theme,
      charWidth: `${ config.charWidth }px`,
    });
  }

  windowIsFullscreen = () => {
    return window.innerHeight === window.screen.height;
  };

  showOrHideTitleBar = (start) => {
    const now = new Date().getTime();
    if (now - start > 150) {
      return;
    }

    const { config, dispatch } = this.props;
    const isTitleBarVisible = !this.windowIsFullscreen();
    if (isTitleBarVisible !== config.isTitleBarVisible) {
      dispatch(updateConfig({ isTitleBarVisible }));
      setCustomProperties({
        titleBarHeight: isTitleBarVisible ? config.theme.titleBarHeight : '0px',
      });
    }

    window.requestAnimationFrame(this.showOrHideTitleBar.bind(this, start));
  };

  render () {
    const { config, views } = this.props;
    return (
      <div className={css.root}>
        {config.isTitleBarVisible && <TitleBar label="Wings" />}
        {config.mode === 'ex' && <CommandBar />}
        <div className={css.views}>
          {config.isTreeViewVisible && <TreeView />}
          {_.map(views, ({ id }, index) => (
            <View viewId={id} key={id} isFirst={index === 0} />
          ))}
          {config.isBrowserVisible && <Browser />}
        </div>
      </div>
    );
  }
}

export default connect(App.mapStateToProps)(App);
