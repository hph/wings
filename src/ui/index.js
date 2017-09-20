import _ from 'lodash';
import React from 'react';
import { render } from 'react-dom';
import { readFile } from 'fs-extra';
import { webFrame } from 'electron';

import { Root } from 'ui/components';
import { computeFontDimensions } from 'ui/utils';

// Disable pinch zoom.
webFrame.setVisualZoomLevelLimits(1, 1);

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
    currentViewId: 0, // Temporary just so we don't throw on load.
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
