import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { ipcRenderer } from 'electron';

import { App } from 'ui/components';
import { DevTools, actions, createStore } from 'ui/state';

class Root extends Component {
  static propTypes = {
    initialState: PropTypes.object.isRequired,
  };

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

    const children = process.env.NODE_ENV === 'development'
      ? (
        <div>
          <App />
          <DevTools />
        </div>
      )
      : <App />;

    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
  }
}

export default Root;
