import { tmpdir } from 'os';
import fs from 'fs-extra';

import {
  computeFontDimensions,
  listContents,
  collapsePath,
  expandPath,
} from './utils';

const noMatchPaths = [
  '/',
  '/foo/bar',
  '/Users/most-likely-not-the-user',
];
const homedir = process.env.HOME;
const matchPaths = [
  [homedir, '~'],
  [`${ homedir }/`, '~/'],
  [`${ homedir }/something`, '~/something'],
];
const root = `${ tmpdir() }/root`;

beforeAll(() => {
  fs.mkdirSync(root);
  fs.mkdirSync(`${ root }/foo`);
  fs.mkdirSync(`${ root }/bar`);
  fs.mkdirSync(`${ root }/bar/unlisted-directory`);

  const touch = path => fs.closeSync(fs.openSync(path, 'w'));
  touch(`${ root }/file`);
  touch(`${ root }/foo/unlisted-file-1`);
  touch(`${ root }/bar/unlisted-directory/unlisted-file-2`);
});

afterAll(() => {
  fs.removeSync(root);
});

test('collapsePath does nothing when a path is not in the home directory', () => {
  noMatchPaths.forEach(path => expect(collapsePath(path)).toEqual(path));
});

test('collapsePath replaces the home path with tilde when applicable', () => {
  matchPaths.forEach(([original, collapsed]) => {
    expect(collapsePath(original)).toEqual(collapsed);
  });
});

test('expandPath does nothing when a path does not start with a tilde', () => {
  noMatchPaths.forEach(path => expect(expandPath(path)).toEqual(path));
});

test('expandPath replaces the tilde with the home directory when applicable', () => {
  // eslint-disable-next-line fp/no-mutating-methods
  [...matchPaths].map(paths => paths.reverse())
    .forEach(([collapsed, original]) => {
      expect(expandPath(collapsed)).toEqual(original);
    });
});

// This function is not properly testable without access to real DOM.
test('computeFontDimensions runs without errors', () => {
  const result = computeFontDimensions({
    theme: {
      lineHeight: 0,
      fontFamily: 0,
      fontSize: 0,
    },
  });
  expect(result.width).toEqual(0);
  expect(result.height).toEqual(0);
});

test('listContents throws when the directory does not exist', () => {
  return listContents(`${ root }/not-there`)
    .then(() => expect(true).toBe(false)) // This will never run.
    .catch(error => expect(error.code).toEqual('ENOENT'));
});

test('listContents returns the path and list of immediate files and subdirectories at the path', () => {
  return listContents(root).then(results => {
    expect(results).toEqual({
      path: root,
      files: [
        'file',
      ],
      directories: [
        'bar',
        'foo',
      ],
    });
  });
});
