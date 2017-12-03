import { join } from 'path';

import { exists, readdir, lstat, unlink, rmdir } from './fs';

export default function rimraf(path) {
  return exists(path).then(pathExists => {
    if (!pathExists) {
      return Promise.resolve();
    }
    return readdir(path).then(subpaths => {
      return Promise.all(
        subpaths.map(subpath => {
          const entryPath = join(path, subpath);
          return lstat(entryPath).then(stats => {
            if (stats.isDirectory()) {
              return rimraf(entryPath);
            }
            return unlink(entryPath);
          });
        }),
      ).then(() => rmdir(path));
    });
  });
}
