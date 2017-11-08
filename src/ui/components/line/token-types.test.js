import { getType, tokenTypes } from './token-types';

describe('tokenTypes', () => {
  it('should have a static value', () => {
    expect(tokenTypes).toMatchSnapshot();
  });
});

describe('getType', () => {
  Object.keys(tokenTypes).forEach(name => {
    const type = getType(tokenTypes[name]);
    it(`should return a static value for ${name}`, () => {
      expect({ name, type }).toMatchSnapshot();
    });
  });
});
