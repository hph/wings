const defaultConfig = require('./default-config');

describe('default config', () => {
  it('should have window as a top-level key', () => {
    expect(defaultConfig.window).toBeDefined();
  });

  it('should have editor as a top-level key', () => {
    expect(defaultConfig.window).toBeDefined();
  });

  it('should only have two top-level keys', () => {
    expect(Object.keys(defaultConfig)).toHaveLength(2);
  });

  it('should have a specific value for the window key', () => {
    expect(defaultConfig.window).toMatchSnapshot();
  });

  it('should have a specific value for the editor key', () => {
    expect(defaultConfig.editor).toMatchSnapshot();
  });
});
