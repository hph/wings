import { tokTypes } from 'acorn-jsx';

/* eslint-disable no-underscore-dangle */

export const tokenTypes = {
  ...tokTypes,
  comment: {},
  _from: {
    label: 'from',
    keyword: 'from',
  },
  _let: {
    label: 'let',
    keyword: 'let',
  },
};

export const getType = type => {
  switch (type) {
    case tokenTypes._export:
    case tokenTypes._from:
    case tokenTypes._import:
      return 'module';

    case tokenTypes._const:
    case tokenTypes._function:
    case tokenTypes._let:
    case tokenTypes._var:
      return 'declaration';

    case tokenTypes._break:
    case tokenTypes._case:
    case tokenTypes._catch:
    case tokenTypes._class:
    case tokenTypes._continue:
    case tokenTypes._debugger:
    case tokenTypes._default:
    case tokenTypes._delete:
    case tokenTypes._do:
    case tokenTypes._else:
    case tokenTypes._extends:
    case tokenTypes._finally:
    case tokenTypes._for:
    case tokenTypes._if:
    case tokenTypes._in:
    case tokenTypes._instanceof:
    case tokenTypes._new:
    case tokenTypes._return:
    case tokenTypes._super:
    case tokenTypes._switch:
    case tokenTypes._this:
    case tokenTypes._throw:
    case tokenTypes._try:
    case tokenTypes._typeof:
    case tokenTypes._void:
    case tokenTypes._while:
    case tokenTypes._with:
      return 'keyword';

    case tokenTypes._false:
    case tokenTypes._true:
    case tokenTypes._null:
    case tokenTypes._undefined:
    case tokenTypes.string:
    case tokenTypes.template:
    case tokenTypes.invalidTemplate:
    case tokenTypes.num:
    case tokenTypes.regexp:
      return 'value';

    case tokenTypes.bitShift:
    case tokenTypes.bitwiseAND:
    case tokenTypes.bitwiseOR:
    case tokenTypes.bitwiseXOR:
    case tokenTypes.eq:
    case tokenTypes.logicalAND:
    case tokenTypes.logicalOR:
    case tokenTypes.modulo:
    case tokenTypes.star:
    case tokenTypes.starstar:
    case tokenTypes.plusMin:
    case tokenTypes.arrow:
    case tokenTypes.incDec:
    case tokenTypes.ellipsis:
    case tokenTypes.equality:
    case tokenTypes.question:
    case tokenTypes.slash:
    case tokenTypes.colon:
      return 'operator';

    case tokenTypes.assign:
    case tokenTypes.backQuote:
    case tokenTypes.braceL:
    case tokenTypes.braceR:
    case tokenTypes.bracketL:
    case tokenTypes.bracketR:
    case tokenTypes.comma:
    case tokenTypes.dollarBraceL:
    case tokenTypes.dot:
    case tokenTypes.eof:
    case tokenTypes.parenL:
    case tokenTypes.parenR:
    case tokenTypes.prefix:
    case tokenTypes.relational:
      return 'other';

    case tokenTypes.jsxName:
    case tokenTypes.jsxTagEnd:
    case tokenTypes.jsxTagStart:
      return 'jsx';

    case tokenTypes.comment:
    case tokenTypes.semi:
      return 'comment';

    case tokenTypes.jsxText:
    case tokenTypes.name:
    default:
      return 'name';
  }
};

/* eslint-enable no-underscore-dangle */
