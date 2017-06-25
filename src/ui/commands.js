import _ from 'lodash';

import { insertAt, updateFrom } from 'ui/utils';

export function insert ({ column, row, lines, value }) {
  return {
    lines: insertAt(lines, insertAt(lines[row], value, column), row),
    column: column + 1,
  };
}

export function replace ({ column, row, lines, value }) {
  const newLine = updateFrom(lines[row], value, column - 1, column);
  return {
    lines: insertAt(lines, newLine, row),
  };
}

export function indent ({ column, row, lines, shiftWidth }) {
  const line = lines[row];
  const newLines = _.clone(lines);
  const spaces = _.pad(' ', shiftWidth);
  newLines[row] = line.substring(0, column) + spaces + line.substring(column);
  return {
    lines: newLines,
    column: column + shiftWidth,
  };
}

export function joinLineAbove ({ row, lines }) {
  if (row === 0) {
    return {
      lines,
      row,
    };
  }
  const joinedLine = lines[row - 1] + lines[row];
  const newLines = updateFrom(lines, joinedLine, row - 1, row + 1);
  return {
    column: lines[row - 1].length,
    lines: newLines,
    row: row - 1,
  };
}

export function joinLineBelow ({ row, column, lines }) {
  if (row === lines.length - 1) {
    return {
      column,
      lines,
      row,
    };
  }
  const line = lines[row];
  const nextLine = lines[row + 1];
  const delimiter = (line === '' || _.last(line) === ' ' ||
                     nextLine === '' || _.first(nextLine) === ' ') ? '' : ' ';
  const joinedLine = line + delimiter + nextLine;
  const newLines = updateFrom(lines, joinedLine, row, row + 2);
  return {
    row,
    column: lines[row].length,
    lines: newLines,
  };
}

export function removeBefore ({ column, row, lines }) {
  const newLine = updateFrom(lines[row], '', column - 1, column);
  const newLines = insertAt(lines, newLine, row);
  return {
    lines: newLines,
    column: column > 0 ? column - 1 : 0,
  };
}

export function remove (options) {
  if (options.column === 0) {
    return joinLineAbove(options);
  }
  return removeBefore(options);
}

export function removeAt ({ column, row, lines }) {
  const newLine = updateFrom(lines[row], '', column, column + 1);
  return {
    row,
    column: _.min([_.max([0, newLine.length - 1]), column]),
    lines: insertAt(lines, newLine, row),
  };
}

export function removeFromCursor ({ column, row, lines }) {
  const newLine = updateFrom(lines[row], '', column, lines[row].length);
  return {
    lines: insertAt(lines, newLine, row),
  };
}

export function splitLines ({ column, row, lines }) {
  const line = lines[row];
  const asTwoLines = [line.substring(0, column), line.substring(column)];
  const newLines = updateFrom(lines, asTwoLines, row, row + 1);
  return {
    lines: newLines,
    column: 0,
    row: row + 1,
  };
}

export function upOrDown ({ column, row, lines, prevMaxColumn }, direction) {
  const nextMaxColumn = _.max([0, lines[row + direction].length - 1]);
  let nextColumn = nextMaxColumn;
  let nextPrevMaxColumn = prevMaxColumn;
  if (nextMaxColumn < column) {
    nextPrevMaxColumn = _.max([column, prevMaxColumn]);
  } else {
    nextColumn = _.min([_.max([column, prevMaxColumn]), nextMaxColumn]);
  }
  return {
    column: nextColumn,
    row: row + direction,
    prevMaxColumn: nextPrevMaxColumn,
  };
}

export function maybeMoveLeft ({ column }) {
  return {
    column: column === 0 ? column : column - 1,
    prevMaxColumn: 0,
  };
}

export function moveAfterEnd ({ row, lines }) {
  return {
    column: lines[row].length,
    prevMaxColumn: 0,
  };
}

export function moveDown (options) {
  return options.row < options.lines.length - 1 ? upOrDown(options, 1) : options;
}

export function moveLeft ({ column }) {
  return {
    column: column === 0 ? 0 : column - 1,
    prevMaxColumn: 0,
  };
}

export function moveRight ({ column, row, lines }) {
  return {
    column: column < lines[row].length - 1 ? column + 1 : column,
    prevMaxColumn: 0,
  };
}

export function moveRightMaybeAfterEnd ({ column, row, lines }) {
  if ((column === 0 && lines[row] === '') || (column > lines[row].length)) {
    return {
      column,
      prevMaxColumn: 0,
    };
  }
  return {
    column: column + 1,
    prevMaxColumn: 0,
  };
}

export function moveToFirstNonWhitespace ({ row, lines }) {
  return {
    column: lines[row].search(/\S|$/),
    prevMaxColumn: 0,
  };
}

export function moveToStart (options) {
  return {
    ...options,
    column: 0,
    prevMaxColumn: 0,
  };
}

export function moveToEnd ({ row, lines }) {
  return {
    column: _.max([0, lines[row].length - 1]),
    prevMaxColumn: 0,
  };
}

export function moveUp (options) {
  return options.row === 0 ? options : upOrDown(options, -1);
}

export function newLineAbove ({ row, lines }) {
  return {
    lines: updateFrom(lines, ['', lines[row]], row, row + 1),
    column: 0,
    prevMaxColumn: 0,
  };
}

export function newLineBelow ({ row, lines }) {
  return {
    lines: updateFrom(lines, [lines[row], ''], row, row + 1),
    column: 0,
    row: row + 1,
    prevMaxColumn: 0,
  };
}

export function goToFirstLine ({ lines }) {
  return {
    column: 0,
    row: 0,
  };
}

export function goToLastLine ({ lines }) {
  return {
    column: 0,
    row: lines.length - 1,
  };
}

export function nextWord ({ column, row, lines }) {
  const getNext = (col, offset, newLine = false) => {
    if (!_.isString(lines[row + offset])) {
      return { column, row };
    }
    const string = lines[row + offset].substring(col);
    const pattern = newLine > 0 ? /\w/ : /\s\S/;
    const nextWordIndex = string.search(pattern);
    if (nextWordIndex > -1) {
      return {
        column: _.max([0, newLine ? nextWordIndex - 1 : nextWordIndex + col + 1]),
        row: row + offset,
        prevMaxColumn: 0,
      };
    }
    return getNext(0, offset + 1, true);
  };
  return getNext(column, 0);
}
