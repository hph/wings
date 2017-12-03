module.exports = {
  displayName: 'lint:eslint',
  runner: 'jest-runner-eslint',
  testMatch: ['**/*.js'],
  testPathIgnorePatterns: ['/build/', '/coverage/', '/node_modules/'],
};
