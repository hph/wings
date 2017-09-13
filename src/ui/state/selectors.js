import _ from 'lodash';
import { createSelector } from 'reselect';

export const currentView = createSelector(
  state => state.views,
  state => state.config.currentViewId,
  (views, currentViewId) => currentViewId
    ? _.find(views, ({ id }) => id === currentViewId)
    : views[0],
);

export const viewSelection = createSelector(
  state => state.selections,
  (state, props) => props.viewId,
  (selections, viewId) => selections[viewId],
);
