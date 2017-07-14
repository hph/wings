import _ from 'lodash';
import fs from 'fs-extra';
import { join as joinPaths } from 'path';
import { reduce } from 'bluebird';

/**
 * Calculate the dimensions of characters in the monospaced font
 * as defined by the configuration object.
 */
export function computeFontDimensions (config) {
  const testString = 'The quick brown fox jumps over the lazy dog';
  const el = document.createElement('span');
  el.innerText = testString;
  el.style.lineHeight = config.theme.lineHeight;
  el.style.fontFamily = config.theme.fontFamily;
  el.style.fontSize = config.theme.fontSize;
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

export function insertAt (original, value, index) {
  if (_.isArray(original)) {
    const copy = [...original];
    copy[index] = value;
    return copy;
  } else if (_.isString(original)) {
    return original.substring(0, index) + value + original.substring(index);
  }
  return original;
}

export function updateFrom (original, value, start, end) {
  if (_.isArray(original)) {
    const toStart = _.slice(original, 0, start);
    const fromEnd = _.slice(original, end);
    return [...toStart, ..._.castArray(value), ...fromEnd];
  } else if (_.isString(original)) {
    return original.substring(0, start) + value + original.substring(end);
  }
  return original;
}

/**
 * Return a an object with the immediate files and directories inside
 * a given directory.
 */
export function listContents (path) {
  const defaults = {
    path,
    files: [],
    directories: [],
  };

  return fs.readdir(path).then(subpaths => {
    return reduce(subpaths, (acc, subpath) => {
      return fs.lstat(joinPaths(path, subpath)).then(stats => {
        if (stats.isDirectory()) {
          acc.directories = [...acc.directories, subpath];
        } else {
          acc.files = [...acc.files, subpath];
        }
        return acc;
      });
    }, defaults);
  });
}
