import { applyMiddleware, createStore, compose } from 'redux';

import {
  DevTools,
  reducer,
  createUserInputMiddleware,
} from 'ui/state';


export default function configureStore (initialState) {
  let enhancer = applyMiddleware(createUserInputMiddleware());

  if (process.env.NODE_ENV === 'development') {
    enhancer = compose(enhancer, DevTools.instrument({ maxAge: 30 }));
  }

  return createStore(reducer, initialState, enhancer);
}
