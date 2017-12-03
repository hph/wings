import { tmpdir } from 'os';

import { mkdir, open, close, rimraf } from 'lib/io';
import {
  computeFontDimensions,
  listContents,
  collapsePath,
  expandPath,
  insertAt,
  updateFrom,
} from './utils';

const noMatchPaths = ['/', '/foo/bar', '/Users/most-likely-not-the-user'];
const homedir = process.env.HOME;
const matchPaths = [
  [homedir, '~'],
  [`${homedir}/`, '~/'],
  [`${homedir}/something`, '~/something'],
];
const root = `${tmpdir()}/root`;

beforeAll(() => {
  const chain = (fn, args) => {
    if (args[0]) {
      return fn(args[0]).then(() => chain(fn, args.slice(1)));
    }
    return Promise.resolve();
  };

  return chain(mkdir, [
    root,
    `${root}/foo`,
    `${root}/bar`,
    `${root}/bar/unlisted-directory`,
  ]).then(() => {
    const touch = path => open(path, 'w').then(close);
    return chain(touch, [
      `${root}/file`,
      `${root}/foo/unlisted-file-1`,
      `${root}/bar/unlisted-directory/unlisted-file-2`,
    ]);
  });
});

afterAll(() => {
  return rimraf(root);
});

describe('collapsePath', () => {
  it('does nothing when a path is not in the home directory', () => {
    noMatchPaths.forEach(path => expect(collapsePath(path)).toEqual(path));
  });

  it('replaces the home path with tilde when applicable', () => {
    matchPaths.forEach(([original, collapsed]) => {
      expect(collapsePath(original)).toEqual(collapsed);
    });
  });
});

describe('expandPath', () => {
  it('does nothing when a path does not start with a tilde', () => {
    noMatchPaths.forEach(path => expect(expandPath(path)).toEqual(path));
  });

  it('replaces the tilde with the home directory when applicable', () => {
    [...matchPaths]
      .map(paths => paths.reverse()) // eslint-disable-line fp/no-mutating-methods
      .forEach(([collapsed, original]) => {
        expect(expandPath(collapsed)).toEqual(original);
      });
  });
});

describe('computeFontDimensions', () => {
  // This function is not properly testable without access to real DOM.
  it('runs without errors', () => {
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
});

describe('listContents', () => {
  it('throws when the directory does not exist', () => {
    return listContents(`${root}/not-there`)
      .then(() => expect(true).toBe(false)) // This will never run.
      .catch(error => expect(error.code).toEqual('ENOENT'));
  });

  it('returns the path and list of immediate files and subdirectories at the path', () => {
    return listContents(root).then(results => {
      expect(results).toEqual({
        path: root,
        files: ['file'],
        directories: ['bar', 'foo'],
      });
    });
  });
});

describe('insertAt', () => {
  it('returns a new array with the value at the index updated', () => {
    const original = [1, 2, 3];
    expect(insertAt(original, 'new', 1)).toEqual([1, 'new', 3]);
    expect(original).toEqual([1, 2, 3]);
  });

  it('returns a new string with the value inserted at index', () => {
    expect(insertAt('hello', 'hi', 1)).toEqual('hhiello');
  });

  it('does nothing and returns non-array or string values back', () => {
    expect(insertAt(0)).toEqual(0);
  });
});

describe('updateFrom', () => {
  it('returns a new array with the items inserted between the start and end', () => {
    const original = [1, 2, 3];
    expect(updateFrom(original, [-1, -2], 1, 2)).toEqual([1, -1, -2, 3]);
    expect(original).toEqual([1, 2, 3]);
  });

  it('returns a new string with the items inserted between the start and end', () => {
    expect(updateFrom('hello', 'hi', 1, 4)).toEqual('hhio');
  });

  it('does nothing and returns non-array or string values back', () => {
    expect(updateFrom(0)).toEqual(0);
  });
});
