import { applyMiddleware, createStore, compose } from 'redux';
import { createLogger } from 'redux-logger';

import { middleware, reducer } from 'ui/state';

export default function configureStore (initialState) {
  const enhancer = compose(
    middleware,
    applyMiddleware(createLogger()),
  );
  // Make the store available in the console in development for debugging.
  return window.store = createStore(reducer, initialState, enhancer);
}
