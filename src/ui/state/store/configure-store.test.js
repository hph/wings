import configureStore from 'ui/state/store/configure-store';

describe('configureStore', () => {
  const args = {
    configDefaults: {},
    getPreloadedState: jest.fn(() => ({})),
    getText: jest.fn(filename =>
      Promise.resolve(filename ? `${filename}\n` : undefined),
    ),
  };

  it('should return a promise resolving to a newly created store', () => {
    return configureStore(args).then(store => {
      expect(store.getState).toBeDefined();
      expect(store.dispatch).toBeDefined();
      expect(store.subscribe).toBeDefined();
    });
  });

  it('should populate the config with any provided defaults', () => {
    const configDefaults = { mode: 'normal', foo: 'bar' };
    return configureStore({
      ...args,
      configDefaults,
    }).then(store => {
      expect(store.getState().config).toEqual(
        expect.objectContaining(configDefaults),
      );
    });
  });

  it('should always provide a currentPaneId', () => {
    return configureStore(args).then(store => {
      expect(store.getState().config.currentPaneId).toEqual(0);
    });
  });

  it('should provide an empty panes state if no file is provided', () => {
    return configureStore(args).then(store => {
      expect(store.getState().panes).toEqual([]);
    });
  });

  it('should create a pane if a file is provided', () => {
    const filename = 'file.txt';
    return configureStore({
      ...args,
      getPreloadedState: jest.fn(() => ({ filename })),
    }).then(store => {
      expect(store.getState().panes[0]).toEqual({
        filename,
        column: 0,
        firstVisibleColumn: 0,
        firstVisibleRow: 0,
        height: 0,
        id: 0,
        lines: [filename],
        row: 0,
        width: 0,
      });
    });
  });

  it('should determine the width and height by looking at window.screen', () => {
    window.screen.height = 17;
    window.screen.width = 42;
    return configureStore({
      ...args,
      getPreloadedState: jest.fn(() => ({ filename: 'file.txt' })),
    }).then(store => {
      expect(store.getState().panes[0]).toEqual(
        expect.objectContaining({
          height: window.screen.height,
          width: window.screen.width,
        }),
      );
    });
  });

  it('should create an empty file state for a new file', () => {
    return configureStore({
      ...args,
      getText: jest.fn(() => Promise.reject({ code: 'ENOENT' })),
    }).then(store => {
      expect(store.getState().panes[0]).toEqual(
        expect.objectContaining({
          lines: [''],
        }),
      );
    });
  });

  it('should rethrow any unexpected errors thrown by getText', () => {
    return expect(
      configureStore({
        ...args,
        getText: jest.fn(() => Promise.reject({})),
      }),
    ).rejects.toEqual({});
  });
});
