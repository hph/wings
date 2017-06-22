import { applyMiddleware, createStore } from 'redux';

import {
  createUserInputMiddleware,
  createCursorPositionMiddleware,
  reducer,
} from 'ui/state';

export default function configureStore (initialState) {
  const enhancer = applyMiddleware(
    createUserInputMiddleware(),
    createCursorPositionMiddleware(),
  );
  return createStore(reducer, initialState, enhancer);
}
