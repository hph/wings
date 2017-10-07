import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ipcRenderer, webFrame } from 'electron';

import { App } from 'ui/components';
import { configureStore } from 'ui/state';

export default class Root extends Component {
  constructor (props) {
    super(props);
    this.state = {};

    configureStore().then(store => {
      this.setState({ store });
    });

    // Disable pinch zoom.
    webFrame.setVisualZoomLevelLimits(1, 1);
  }

  componentDidUpdate () {
    // Notify Electron that the app is ready and the window can be shown.
    ipcRenderer.send('root-mounted', true);
  }

  render () {
    const { store } = this.state;
    return store ? (
      <Provider store={store}>
        <App />
      </Provider>
    ) : null;
  }
}
