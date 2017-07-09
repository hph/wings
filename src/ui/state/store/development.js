import { applyMiddleware, createStore, compose } from 'redux';
import { createLogger } from 'redux-logger';

import { middleware, reducer } from 'ui/state';

export default function configureStore (initialState) {
  const enhancer = compose(
    middleware,
    applyMiddleware(createLogger()),
  );
  return createStore(reducer, initialState, enhancer);
}
