import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { userInputFocus } from 'ui/state/actions';
import css from './styles.css';

function withScheme (url) {
  return url.match(/^https?:\/\//) ? url : url.replace('', 'http://');
}

class Browser extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  static mapStateToProps () {
    return {};
  }

  state = {
    location: '',
    error: '',
    navLocation: 'http://google.com',
  };

  componentDidMount () {
    this.navigation.select();

    // Keep the navigation location in sync with internal webview navigation.
    this.webview.addEventListener('will-navigate', ({ url }) => {
      this.setState({ navLocation: url });
    });

    // Keep the navigation location in sync with redirects from the server.
    this.webview.addEventListener('did-get-redirect-request', (event) => {
      const { newURL: newUrl, isMainFrame } = event;
      if (newUrl && isMainFrame) {
        this.setState({ navLocation: event.newURL });
      }
    });

    this.webview.addEventListener('did-fail-load', ({ errorDescription }) => {
      this.setState({ error: errorDescription });
    });
  }

  onNavigationClick = () => {
    this.props.dispatch(userInputFocus(false));
  };

  setNavLocation = event => {
    this.setState({ navLocation: event.target.value });
  };

  navigate = event => {
    if (event.key === 'Enter') {
      const nextLocation = withScheme(this.state.navLocation);
      if (nextLocation === this.state.location) {
        this.webview.reload();
      } else {
        this.setState({
          error: '',
          location: nextLocation,
          navLocation: nextLocation,
        });
      }
    }
  };

  render () {
    return (
      <div className={css.root}>
        <input
          className={css.navigation}
          ref={node => this.navigation = node}
          type="text"
          value={this.state.navLocation}
          onChange={this.setNavLocation}
          onKeyDown={this.navigate}
          onClick={this.onNavigationClick}
          autoFocus
        />
        {this.state.error && (
          <div className={css.errorContainer}>
            <div>Error: {this.state.error}</div>
          </div>
        )}
        <webview
          className={css.webview}
          ref={node => this.webview = node}
          src={this.state.location}
        />
      </div>
    );
  }
}

export default connect(Browser.mapStateToProps)(Browser);
