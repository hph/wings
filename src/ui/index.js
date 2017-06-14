import _ from 'lodash';
import React from 'react';
import { render } from 'react-dom';
import { readFile } from 'fs';

import { Root } from 'ui/containers';
import { computeFontDimensions } from 'ui/utils';

const { config, filename } = JSON.parse(window.location.hash.slice(1));
const { width, height } = computeFontDimensions(config);
const initialState = {
  filename,
  config: {
    charWidth: width,
    charHeight: _.ceil(height),
    mode: 'normal',
    ...config,
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
