describe('store index', () => {
  it('should import the production file when in production mode', () => {
    process.env.NODE_ENV = 'production';
    const configureStore = require('./index'); // eslint-disable-line global-require
    expect(configureStore).toBeDefined();
  });
});
