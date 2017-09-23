import _ from 'lodash';

import { CREATE_VIEW, DESTROY_VIEW } from 'ui/state/types';
import { updateConfig } from 'ui/state/actions';

export default function setCurrentView ({ getState, dispatch }) {
  return next => action => {
    if (action.type === CREATE_VIEW) {
      setTimeout(() => {
        dispatch(updateConfig({ currentViewId: action.id }));
      });
    } else if (action.type === DESTROY_VIEW) {
      const { views } = getState();
      const nextView = _.find(views, ({ id }) => id !== action.id);
      setTimeout(() => {
        dispatch(updateConfig({ currentViewId: nextView && nextView.id }));
      });
    }

    return next(action);
  };
}
