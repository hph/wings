import { createStore } from 'redux';

import { middleware, reducer } from 'ui/state';

export default function configureStore (initialState) {
  return createStore(reducer, initialState, middleware);
}
