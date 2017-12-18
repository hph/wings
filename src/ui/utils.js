import { join as joinPaths } from 'path';

import { lstat, readdir } from 'lib/io';

/**
 * Calculate the dimensions of characters in the monospaced font
 * as defined by the configuration object.
 */
export function computeFontDimensions({ fontFamily, fontSize, lineHeight }) {
  const testString = 'The quick brown fox jumps over the lazy dog';
  const el = document.createElement('span');
  el.innerText = testString;
  el.style.lineHeight = lineHeight;
  el.style.fontFamily = fontFamily;
  el.style.fontSize = fontSize;
  el.style.whiteSpace = 'nowrap';
  el.style.position = 'absolute';
  el.style.top = 0;
  el.style.left = 0;
  el.style.opacity = 0;
  document.body.appendChild(el);
  const { width, height } = el.getBoundingClientRect();
  el.remove();
  return {
    height,
    width: width / testString.length,
  };
}

export function insertAt(original, value, index) {
  if (Array.isArray(original)) {
    const copy = [...original];
    copy[index] = value;
    return copy;
  } else if (typeof original === 'string') {
    return original.substring(0, index) + value + original.substring(index);
  }
  return original;
}

export function updateFrom(original, value, start, end) {
  if (Array.isArray(original)) {
    const toStart = original.slice(0, start);
    const fromEnd = original.slice(end);
    return [
      ...toStart,
      ...(Array.isArray(value) ? value : [value]),
      ...fromEnd,
    ];
  } else if (typeof original === 'string') {
    return original.substring(0, start) + value + original.substring(end);
  }
  return original;
}

/**
 * Return a an object with the immediate files and directories inside
 * a given directory.
 */
export function listContents(path) {
  const defaults = {
    path,
    files: [],
    directories: [],
  };

  return readdir(path).then(subpaths => {
    return subpaths.reduce((accumulator, subpath) => {
      return accumulator.then(acc => {
        return lstat(joinPaths(path, subpath)).then(stats => {
          if (stats.isDirectory()) {
            acc.directories = [...acc.directories, subpath];
          } else {
            acc.files = [...acc.files, subpath];
          }
          return acc;
        });
      });
    }, Promise.resolve(defaults));
  });
}

/**
 * Replace /Users/$whoami with tilde (~) when applicable.
 */
const homePattern = new RegExp(`^${process.env.HOME}`);
export function collapsePath(path) {
  return path.replace(homePattern, '~');
}

/**
 * Replace tilde (~) with /Users/$whoami when applicable.
 */
export function expandPath(path) {
  return path.replace(/^~/, process.env.HOME);
}
