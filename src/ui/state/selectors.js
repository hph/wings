import { createSelector } from 'reselect';

import { computeFontDimensions } from 'ui/utils';

export const currentPane = createSelector(
  state => state.panes,
  state => state.config.currentPaneId,
  (panes, currentPaneId) =>
    currentPaneId ? panes.find(({ id }) => id === currentPaneId) : panes[0],
);

export const paneById = createSelector(
  state => state.panes,
  (state, props) => props.paneId,
  (panes, paneId) => panes.find(({ id }) => id === paneId),
);

export const charSizes = createSelector(
  state => state.config.theme,
  theme => {
    const { width, height } = computeFontDimensions(theme);
    return {
      charHeight: height,
      charWidth: width,
    };
  },
);
