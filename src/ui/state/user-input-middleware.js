// TODO Implement a middleware to dispatch user input values as actions.
export default function createUserInputMiddleware () {
  return () => next => action => next(action);
}
