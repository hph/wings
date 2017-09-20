import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import setCustomProperties from 'dynamic-css-properties';

import {
  Browser,
  CommandBar,
  Logo,
  TitleBar,
  TreeView,
  View,
} from 'ui/components';
import { updateConfig } from 'ui/state/actions';
import css from './styles.css';

export class App extends Component {
  constructor (props) {
    super(props);
    this.setCustomProperties();
  }

  componentDidMount () {
    // Determine whether the titlebar should be shown or hidden on resize.
    window.addEventListener('resize', this.onResize);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.theme !== this.props.theme) {
      this.setCustomProperties();
    }
  }

  onResize = () => {
    this.showOrHideTitleBar(new Date().getTime());
  };

  setCustomProperties () {
    const { charWidth, isTitleBarVisible, theme } = this.props;
    setCustomProperties({
      ...theme,
      charWidth: `${ charWidth }px`,
      titleBarHeight: isTitleBarVisible ? theme.titleBarHeight : '0px',
      viewportHeight: 'calc(100vh - var(--title-bar-height)',
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

    const isTitleBarVisible = !this.windowIsFullscreen();
    if (isTitleBarVisible !== this.props.isTitleBarVisible) {
      this.props.updateConfig({ isTitleBarVisible });
      this.setCustomProperties();
    }

    window.requestAnimationFrame(this.showOrHideTitleBar.bind(this, start));
  };

  render () {
    return (
      <div className={css.root}>
        {this.props.isTitleBarVisible && <TitleBar label="Wings" />}
        {this.props.isCommandBarVisible && <CommandBar />}
        <div className={css.views}>
          {this.props.isTreeViewVisible && <TreeView />}
          {_.isEmpty(this.props.views) ? <Logo /> : (
            _.map(this.props.views, ({ id }, index) => (
              <View viewId={id} key={id} isFirst={index === 0} />
            ))
          )}
          {this.props.isBrowserVisible && <Browser />}
        </div>
      </div>
    );
  }
}

App.propTypes = {
  charWidth: PropTypes.number.isRequired,
  isBrowserVisible: PropTypes.bool.isRequired,
  isCommandBarVisible: PropTypes.bool.isRequired,
  isTitleBarVisible: PropTypes.bool.isRequired,
  isTreeViewVisible: PropTypes.bool.isRequired,
  theme: PropTypes.object.isRequired,
  updateConfig: PropTypes.func.isRequired,
  views: PropTypes.array.isRequired,
};

export function mapStateToProps (state) {
  return {
    charWidth: state.config.charWidth,
    isBrowserVisible: state.config.isBrowserVisible,
    isCommandBarVisible: state.config.mode === 'ex',
    isTitleBarVisible: state.config.isTitleBarVisible,
    isTreeViewVisible: state.config.isTreeViewVisible,
    theme: state.config.theme,
    views: state.views,
  };
}

export default connect(mapStateToProps, { updateConfig })(App);
