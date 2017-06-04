import _ from 'lodash';
import React from 'react';
import { render } from 'react-dom';
import { readFile } from 'fs';
import { ipcRenderer } from 'electron';

import { Root } from 'ui/containers';
import computeFontDimensions from 'ui/utils';

ipcRenderer.on('init', (event, { config, filename }) => {
  const { width, height } = computeFontDimensions(config.editor);
  const initialState = {
    filename,
    config: {
      charWidth: width,
      charHeight: _.ceil(height),
      mode: 'normal',
      ...config.editor,
    },
  };

  const renderApp = (state = initialState) =>
    render(<Root initialState={state} />, document.getElementById('container'));

  if (filename) {
    readFile(filename, { encoding: 'utf-8' }, (err, text) => {
      initialState.text = text;
      renderApp();
    });
  } else {
    renderApp();
  }
});

// Ask the main process to emit "init" with the initial state.
ipcRenderer.send('request-init');
