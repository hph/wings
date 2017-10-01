import _ from 'lodash';
import { createSelector } from 'reselect';

export const currentPane = createSelector(
  state => state.panes,
  state => state.config.currentPaneId,
  (panes, currentPaneId) => currentPaneId
    ? _.find(panes, ({ id }) => id === currentPaneId)
    : panes[0],
);

export const paneById = createSelector(
  state => state.panes,
  (state, props) => props.paneId,
  (panes, paneId) => _.find(panes, ({ id }) => id === paneId),
);
