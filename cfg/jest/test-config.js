module.exports = {
  displayName: 'test:jest',
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
    'webpack-environment-specific-relative-module': './development',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '\\.svg$': 'jest-raw-loader',
  },

  // Workaround for a jsdom issue, see here:
  // https://github.com/facebook/jest/issues/6766
  testURL: 'http://localhost',
};
