import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
import Dispatcher from 'redux-devtools-dispatch';
import MultipleMonitors from 'redux-devtools-multiple-monitors';

import * as actions from 'ui/state/actions';

export default createDevTools(
  <DockMonitor
    toggleVisibilityKey="ctrl-h"
    changePositionKey="ctrl-q"
    changeMonitorKey="ctrl-m"
    defaultIsVisible={false}
  >
    <MultipleMonitors>
      <LogMonitor theme="solarized" />
      <Dispatcher theme="solarized" actionCreators={actions} />
    </MultipleMonitors>
  </DockMonitor> // eslint-disable-line comma-dangle
);
