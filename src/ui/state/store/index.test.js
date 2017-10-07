describe('store', () => {
  it('should export a different store based on the NODE_ENV value', () => {
    // eslint-disable-next-line global-require
    const defaultExport = require('./index');

    // Object.defineProperty is used here because otherwise Webpack interferes
    // with the value.
    // eslint-disable-next-line fp/no-mutating-methods
    Object.defineProperty(process, 'env', {
      value: {
        NODE_ENV: 'production',
      },
    });

    jest.resetModules();
    // eslint-disable-next-line global-require
    const productionExport = require('./index');

    expect(defaultExport).not.toEqual(productionExport);
  });
});
