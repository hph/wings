import { createStore, compose } from 'redux';

import { DevTools, middleware, reducer } from 'ui/state';

export default function configureStore (initialState) {
  const enhancer = compose(
    middleware,
    DevTools.instrument({ maxAge: 30 }),
  );
  return createStore(reducer, initialState, enhancer);
}
