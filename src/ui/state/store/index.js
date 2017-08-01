const file = process.env.NODE_ENV === 'production'
  ? 'production'
  : 'development'; // Also use this store in the test environment.
// eslint-disable-next-line import/no-dynamic-require
module.exports = require(`./${ file }`).default;
