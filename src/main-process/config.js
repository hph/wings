import _ from 'lodash';
import os from 'os';
import path from 'path';
import { props } from 'bluebird';
import { readFile } from 'fs-extra';

/**
 * Read and resolve the user's config file as JSON if there is one,
 * otherwise resolve an empty object.
 */
function getUserConfig() {
  return readFile(path.join(os.homedir(), '.wings.conf.json'), {
    encoding: 'utf-8',
  })
    .then(JSON.parse)
    .catch(() => ({})); // A missing user config file is completely acceptable.
}

/**
 * Read and resolve the default config as JSON.
 */
function getDefaultConfig() {
  return readFile(path.join(__dirname, 'default-config.json'), {
    encoding: 'utf-8',
  }).then(JSON.parse);
}

/**
 * Resolve the application config object, which is composed of default
 * settings and any custom settings defined by the user.
 */
export default function getConfig() {
  return props({
    defaultConfig: getDefaultConfig(),
    userConfig: getUserConfig(),
  }).then(({ defaultConfig, userConfig }) => {
    const target = { isDefault: _.isEmpty(userConfig) };
    return _.defaultsDeep(target, userConfig, defaultConfig);
  });
}
