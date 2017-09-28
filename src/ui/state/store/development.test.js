import configureStore from './development';

describe('development store', () => {
  it('should expose the store in the console as a side effect', () => {
    expect(window.store).not.toBeDefined();
    configureStore();
    expect(window.store).toBeDefined();
  });

  it('should create something that looks like a store', () => {
    const store = configureStore();
    expect(store.dispatch).toBeDefined();
    expect(store.subscribe).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.replaceReducer).toBeDefined();
  });

  /* eslint-disable no-console */
  it('should log actions that have been dispatched via redux logger', () => {
    console.log = jest.fn();
    const store = configureStore();
    store.dispatch({ type: 'woo' });
    expect(console.log).toHaveBeenCalled();
  });
  /* eslint-enable no-console */
});
