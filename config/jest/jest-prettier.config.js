module.exports = {
  displayName: 'lint:prettier',
  runner: 'jest-runner-prettier',
  testMatch: ['**/*.js', '**/*.json', '**/*.css'],
  testPathIgnorePatterns: ['/build/', '/coverage/', '/node_modules/'],
};
