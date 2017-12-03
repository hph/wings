import fs from 'fs';
import { promisify } from 'util';

export const close = promisify(fs.close);
export const exists = promisify(fs.exists);
export const lstat = promisify(fs.lstat);
export const mkdir = promisify(fs.mkdir);
export const open = promisify(fs.open);
export const readFile = promisify(fs.readFile);
export const readdir = promisify(fs.readdir);
export const rename = promisify(fs.rename);
export const rmdir = promisify(fs.rmdir);
export const unlink = promisify(fs.unlink);
export const writeFile = promisify(fs.writeFile);
