import _fs from 'fs';

import * as fs from './fs';

jest.mock('util', () => ({
  promisify: jest.fn(arg => arg),
}));

jest.mock('fs', () => ({
  close: jest.fn(() => Promise.resolve()),
  exists: jest.fn(() => Promise.resolve()),
  lstat: jest.fn(() => Promise.resolve()),
  mkdir: jest.fn(() => Promise.resolve()),
  open: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve()),
  readdir: jest.fn(() => Promise.resolve()),
  rename: jest.fn(() => Promise.resolve()),
  rmdir: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn(() => Promise.resolve()),
}));

describe('fs', () => {
  Object.keys(fs).forEach(fn => {
    it(`should promisify ${fn}`, () => {
      return fs[fn]().then(() => {
        expect(_fs[fn]).toHaveBeenCalled();
      });
    });
  });
});
