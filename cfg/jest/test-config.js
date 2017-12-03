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
};
