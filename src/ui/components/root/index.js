import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { ipcRenderer } from 'electron';

import { App } from 'ui/components';
import { actions, createStore } from 'ui/state';

export default class Root extends Component {
  componentDidMount () {
    // Notify Electron that the app is ready and the window can be shown.
    ipcRenderer.send('root-mounted', true);
  }

  render () {
    const { filename, text, config } = this.props.initialState;
    const store = createStore({ config });
    if (filename) {
      store.dispatch(actions.createView(filename, text));
    }
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}

Root.propTypes = {
  initialState: PropTypes.object.isRequired,
};
