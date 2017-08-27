import configureStore from './production';

describe('production store', () => {
  it('should create something that looks like a store', () => {
    const store = configureStore();
    expect(store.dispatch).toBeDefined();
    expect(store.subscribe).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.replaceReducer).toBeDefined();
  });

  /* eslint-disable no-console */
  it('should not log actions that have been dispatched via redux logger', () => {
    console.log = jest.fn();
    const store = configureStore();
    store.dispatch({ type: 'woo' });
    expect(console.log).not.toHaveBeenCalled();
  });
  /* eslint-disable no-console */
});
