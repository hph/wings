import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import setCustomProperties from 'dynamic-css-properties';
import _ from 'lodash';

import {
  Browser,
  CommandBar,
  ErrorBoundary,
  Logo,
  Pane,
  TitleBar,
  TreeView,
} from 'ui/components';
import { updateConfig } from 'ui/state/actions';
import { charSizes } from 'ui/state/selectors';
import css from './styles.css';

export class App extends Component {
  constructor (props) {
    super(props);
    props.setTheme(props);
    this.state = {};
  }

  componentDidMount () {
    window.addEventListener('resize', this.onResize);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.theme !== this.props.theme) {
      this.props.setTheme(nextProps);
    }
  }

  // eslint-disable-next-line react/sort-comp
  componentDidCatch (error, info) {
    this.setState({ error, errorStack: info.componentStack });
  }

  onResize = () => {
    this.showOrHideTitleBar(new Date().getTime());
  };

  showOrHideTitleBar = (start) => {
    const now = new Date().getTime();
    if (now - start > 150) {
      return;
    }

    const isTitleBarVisible = !this.props.isFullscreen();
    if (isTitleBarVisible !== this.props.isTitleBarVisible) {
      this.props.showTitleBar(isTitleBarVisible);
      this.props.setTheme({
        isTitleBarVisible,
        charWidth: this.props.charWidth,
        theme: this.props.theme,
      });
    }

    window.requestAnimationFrame(this.showOrHideTitleBar.bind(this, start));
  };

  render () {
    return (
      <div className={css.root}>
        {this.props.isTitleBarVisible && <TitleBar label="Wings" />}
        {this.state.error ? (
          <ErrorBoundary
            type={this.state.error.name}
            message={this.state.error.message}
            info={this.state.errorStack}
          />
        ) : (
          <div className={css.main}>
            {this.props.isCommandBarVisible && <CommandBar />}
            {this.props.isTreeViewVisible && <TreeView />}
            {_.isEmpty(this.props.panes) ? <Logo /> : (
              _.map(this.props.panes, ({ id }, index) => (
                <Pane paneId={id} key={id} isFirst={index === 0} />
              ))
            )}
            {this.props.isBrowserVisible && <Browser />}
          </div>
        )}
      </div>
    );
  }
}

App.propTypes = {
  charWidth: PropTypes.number.isRequired,
  isBrowserVisible: PropTypes.bool.isRequired,
  isCommandBarVisible: PropTypes.bool.isRequired,
  isFullscreen: PropTypes.func.isRequired,
  isTitleBarVisible: PropTypes.bool.isRequired,
  isTreeViewVisible: PropTypes.bool.isRequired,
  panes: PropTypes.array.isRequired,
  setTheme: PropTypes.func.isRequired,
  showTitleBar: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
};

export const setTheme = ({ charWidth, isTitleBarVisible, theme }) => {
  setCustomProperties({
    ...theme,
    charWidth: `${ charWidth }px`,
    titleBarHeight: isTitleBarVisible ? theme.titleBarHeight : '0px',
    viewportHeight: 'calc(100vh - var(--title-bar-height)',
  });
};

export const isFullscreen = () => {
  return window.innerHeight === window.screen.height;
};

export function mapStateToProps (state) {
  const { charWidth } = charSizes(state);
  return {
    charWidth,
    isBrowserVisible: state.config.isBrowserVisible,
    isCommandBarVisible: state.config.mode === 'ex',
    isTitleBarVisible: state.config.isTitleBarVisible,
    isTreeViewVisible: state.config.isTreeViewVisible,
    theme: state.config.theme,
    panes: state.panes,
  };
}

export function mapDispatchToProps (dispatch) {
  return {
    setTheme,
    isFullscreen,
    showTitleBar: isTitleBarVisible => dispatch(updateConfig({ isTitleBarVisible })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
