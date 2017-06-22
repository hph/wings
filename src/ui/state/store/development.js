import { applyMiddleware, createStore, compose } from 'redux';

import {
  DevTools,
  createUserInputMiddleware,
  createCursorPositionMiddleware,
  reducer,
} from 'ui/state';

export default function configureStore (initialState) {
  const enhancer = compose(
    applyMiddleware(
      createUserInputMiddleware(),
      createCursorPositionMiddleware(),
    ),
    DevTools.instrument({ maxAge: 30 }),
  );
  return createStore(reducer, initialState, enhancer);
}
