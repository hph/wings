import _ from 'lodash';

import { CREATE_PANE, DESTROY_PANE } from 'ui/state/types';
import { updateConfig } from 'ui/state/actions';

export default function setCurrentPane({ getState, dispatch }) {
  return next => action => {
    if (action.type === CREATE_PANE) {
      dispatch(updateConfig({ currentPaneId: action.id }));
    } else if (action.type === DESTROY_PANE) {
      const { panes } = getState();
      const nextPane = _.find(panes, ({ id }) => id !== action.id);
      dispatch(updateConfig({ currentPaneId: nextPane && nextPane.id }));
    }

    return next(action);
  };
}
