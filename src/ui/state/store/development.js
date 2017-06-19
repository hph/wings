import { applyMiddleware, createStore, compose } from 'redux';

import { DevTools, reducer, createUserInputMiddleware } from 'ui/state';

export default function configureStore (initialState) {
  const enhancer = compose(
    applyMiddleware(createUserInputMiddleware()),
    DevTools.instrument({ maxAge: 30 }),
  );
  return createStore(reducer, initialState, enhancer);
}
