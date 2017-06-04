import _ from 'lodash';
import os from 'os';
import path from 'path';
import { promisify, props } from 'bluebird';
import { readFile as _readFile } from 'fs';
import { safeLoad } from 'js-yaml';

const readFile = promisify(_readFile);

/**
 * Read and resolve the user's config file as JSON if there is one,
 * otherwise resolve an empty object.
 */
function getUserConfig () {
  return readFile(path.join(os.homedir(), '.wings.conf.yaml'), { encoding: 'utf-8' })
    .then(contents => safeLoad(contents))
    .catch(() => ({})); // A missing user config file is completely acceptable.
}

/**
 * Read and resolve the default config as JSON.
 */
function getDefaultConfig () {
  return readFile(path.join(__dirname, './default-config.yaml'), { encoding: 'utf-8' })
    .then(contents => safeLoad(contents));
}

/**
 * Resolve the application config object, which is composed of default
 * settings and any custom settings defined by the user.
 */
export default function getConfig () {
  return props({
    defaultConfig: getDefaultConfig(),
    userConfig: getUserConfig(),
  }).then(({ defaultConfig, userConfig }) => {
    return _.defaultsDeep(userConfig, defaultConfig);
  });
}
