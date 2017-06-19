import { applyMiddleware, createStore } from 'redux';

import { reducer, createUserInputMiddleware } from 'ui/state';

export default function configureStore (initialState) {
  const enhancer = applyMiddleware(createUserInputMiddleware());
  return createStore(reducer, initialState, enhancer);
}
