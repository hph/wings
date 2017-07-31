import { homedir, tmpdir } from 'os';
import path from 'path';
import fs from 'fs-extra';

import getConfig from './config';

const tmp = tmpdir();
const userConfigPath = path.join(homedir(), '.wings.conf.yaml');
const tmpUserConfigPath = `${ tmp }/wings-conf`;

beforeAll(done => {
  fs.rename(userConfigPath, tmpUserConfigPath, done);
});

afterAll(done => {
  fs.rename(tmpUserConfigPath, userConfigPath, done);
});

test('getConfig returns the default config if there is no user config', () => {
  return getConfig().then(config => {
    expect(config.isDefault).toBe(true);
    expect(config.window).toBeDefined();
    expect(config.editor).toBeDefined();
  });
});

test('getConfig returns user-defined config values and falls back to defaults', () => {
  return fs.writeFile(userConfigPath, 'window:\n  width: test-value')
    .then(getConfig)
    .then(config => {
      expect(config.isDefault).toBe(false);
      expect(config.window.width).toBe('test-value');
      expect(config.window.height).toBe(600);
    });
});
