import fixedKeys from './fixed-keys';

test('is a set', () => {
  expect(fixedKeys).toBeInstanceOf(Set);
});

test('has some fixed keys', () => {
  expect(fixedKeys.has('Enter')).toBe(true);
  expect(fixedKeys.has('Space')).toBe(true);
  expect(fixedKeys.has('Tab')).toBe(true);
});

test('also includes the meta key', () => {
  expect(fixedKeys.has('Meta')).toBe(true);
});

test('does not include non-fixed keys', () => {
  expect(fixedKeys.has('a')).toBe(false);
  expect(fixedKeys.has('b')).toBe(false);
  expect(fixedKeys.has('c')).toBe(false);
});

test('does not include the dead key', () => {
  expect(fixedKeys.has('Dead')).toBe(false);
});

test('has a size of 19', () => {
  expect(fixedKeys.size).toBe(19);
});
