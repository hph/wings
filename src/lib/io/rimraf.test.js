import rimraf from './rimraf';

import { exists, readdir, lstat, unlink, rmdir } from './fs';

jest.mock('./fs', () => ({
  exists: jest.fn(() => Promise.resolve(true)),
  readdir: jest.fn(() => Promise.resolve(['subpath1', 'subpath2'])),
  lstat: jest.fn(() => Promise.resolve({ isDirectory: () => false })),
  unlink: jest.fn(() => Promise.resolve()),
  rmdir: jest.fn(() => Promise.resolve()),
}));

describe('rimraf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve nothing if the path does not exist', () => {
    exists.mockImplementationOnce(() => Promise.resolve(false));
    return rimraf('path').then(() => {
      expect(readdir).not.toHaveBeenCalled();
    });
  });

  it('should call readdir if the path does exist', () => {
    return rimraf('path').then(() => {
      expect(readdir).toHaveBeenCalledWith('path');
    });
  });

  it('should check whether any of the subpaths are directories', () => {
    return rimraf('path').then(() => {
      expect(lstat).toHaveBeenCalledWith('path/subpath1');
      expect(lstat).toHaveBeenCalledWith('path/subpath2');
    });
  });

  it('should call unlink to remove files', () => {
    return rimraf('path').then(() => {
      expect(unlink).toHaveBeenCalledWith('path/subpath1');
      expect(unlink).toHaveBeenCalledWith('path/subpath2');
    });
  });

  it('should eventually remove the initial path', () => {
    return rimraf('path').then(() => {
      expect(rmdir).toHaveBeenCalledWith('path');
    });
  });
});
