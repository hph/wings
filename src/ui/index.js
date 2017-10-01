import _ from 'lodash';
import React from 'react';
import { render } from 'react-dom';
import { readFile } from 'fs-extra';
import { webFrame } from 'electron';

import { Root } from 'ui/components';
import { computeFontDimensions } from 'ui/utils';

// Disable pinch zoom.
webFrame.setVisualZoomLevelLimits(1, 1);

// XXX Not all of config should go into the state.
// XXX Filename should be used to create a view instead of passing it in.
const { config, filename } = JSON.parse(window.location.hash.slice(1));
const { width, height } = computeFontDimensions(config);
const initialState = {
  filename,
  config: {
    ...config,
    charWidth: width,
    charHeight: _.ceil(height),
    mode: 'normal',
    isBrowserVisible: false,
    isTreeViewVisible: false,
    isTitleBarVisible: true,
    isUserTyping: false,
    cwd: process.cwd(),
    currentPaneId: 0, // Temporary just so we don't throw on load.
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
