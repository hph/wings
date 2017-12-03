import { homedir, tmpdir } from 'os';
import path from 'path';

import { rename, writeFile } from 'lib/io';
import getConfig from './config';

const tmp = tmpdir();
const userConfigPath = path.join(homedir(), '.wings.conf.json');
const tmpUserConfigPath = `${tmp}/wings-conf`;

describe('getConfig', () => {
  if (!process.env.CI) {
    beforeAll(() => {
      return rename(userConfigPath, tmpUserConfigPath);
    });

    afterAll(() => {
      return rename(tmpUserConfigPath, userConfigPath);
    });
  }

  it('returns the default config if there is no user config', () => {
    return getConfig().then(config => {
      expect(config.isDefault).toBe(true);
      expect(config.window).toBeDefined();
      expect(config.editor).toBeDefined();
    });
  });

  it('returns user-defined config values and falls back to defaults', () => {
    return writeFile(
      userConfigPath,
      JSON.stringify({ window: { width: 'test-value' } }),
    )
      .then(getConfig)
      .then(config => {
        expect(config.isDefault).toBe(false);
        expect(config.window.width).toBe('test-value');
        expect(config.window.height).toBe(600);
      });
  });
});
