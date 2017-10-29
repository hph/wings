import React from 'react';
import PropTypes from 'prop-types';
import { tokenizer } from 'acorn-jsx';
import { compose, pure, mapProps } from 'recompose';

import { Token } from 'ui/components';
import { tokenTypes, getType } from './token-types';

export const tokenizerOptions = { plugins: { jsx: true }, loc: true };

export const collectTokens = string => {
  const tokens = [];
  let lastPos = 0;
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const token of tokenizer(string, tokenizerOptions)) {
      // Prepend empty space(s) as required.
      if (token.start > lastPos) {
        // eslint-disable-next-line fp/no-mutating-methods
        tokens.push({
          value: ' '.repeat(token.start - lastPos),
        });
      }

      // Set custom types for missing types.
      if (token.value === 'let') {
        // eslint-disable-next-line no-underscore-dangle
        token.type = tokenTypes._let;
      }
      if (token.value === 'from') {
        // eslint-disable-next-line no-underscore-dangle
        token.type = tokenTypes._from;
      }
      if (token.type.label === '`') {
        token.type = tokenTypes.template;
        token.type.label = '`';
      }

      let { value } = token;
      if (token.type === tokenTypes.string) {
        value = string.slice(token.start, token.end);
      }

      // Fix JSX types having a string value.
      if (token.type.label === 'jsxTagStart') {
        value = '<';
      }
      if (token.type.label === 'jsxTagEnd') {
        value = '>';
      }

      // Fix RegExp tokens having an object value.
      if (token.type === tokenTypes.regexp) {
        value = token.value.value.toString();
      }

      // Use the label as the fallback value when the value is not set.
      if (value === undefined) {
        value = token.type.label;
      }

      // eslint-disable-next-line fp/no-mutating-methods
      tokens.push({
        value,
        type: getType(token.type),
      });

      // Set new last position.
      lastPos = token.end;
    }
  } catch (err) {
    return [];
  }

  // Handle comments separately, since they aren't tokenized.
  if (lastPos < string.length) {
    // eslint-disable-next-line fp/no-mutating-methods
    tokens.push({
      type: getType(tokenTypes.comment),
      value: string.substring(lastPos, string.length),
    });
  }

  return tokens;
};

export const Line = ({ children, tokens }) => (
  <div>
    {tokens.length === 0 ? children : tokens.map((token, index) => (
      <Token
        key={index.toString()}
        type={token.type}
      >
        {token.value}
      </Token>
    ))}
  </div>
);

Line.propTypes = {
  children: PropTypes.node.isRequired,
  tokens: PropTypes.array.isRequired,
};

export const mapTokens = props => ({
  ...props,
  tokens: collectTokens(props.children),
});

export default compose(
  pure,
  mapProps(mapTokens),
)(Line);
