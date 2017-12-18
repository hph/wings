import { insertAt, updateFrom } from 'ui/utils';

function upOrDown({ column, row, lines, prevMaxColumn }, direction) {
  const nextMaxColumn = Math.max(0, lines[row + direction].length - 1);
  let nextColumn = nextMaxColumn;
  let nextPrevMaxColumn = prevMaxColumn;
  if (nextMaxColumn < column) {
    nextPrevMaxColumn = Math.max(column, prevMaxColumn);
  } else {
    nextColumn = Math.min(Math.max(column, prevMaxColumn), nextMaxColumn);
  }
  return {
    column: nextColumn,
    row: row + direction,
    prevMaxColumn: nextPrevMaxColumn,
  };
}

export function insert({ column, row, lines, value }) {
  if (Array.isArray(value)) {
    const line = lines[row];
    const before = line.substring(0, column);
    const after = line.substring(column);
    const valueCopy = [...value];
    const lastIndex = Math.max(0, valueCopy.length - 1);

    // Any text in the current line in front of the cursor must be prepended to
    // the first pasted line and any text in the current line under and after
    // the cursor must be appended to the last pasted line.
    valueCopy[0] = `${before}${valueCopy[0] || ''}`;
    valueCopy[lastIndex] = `${valueCopy[lastIndex] || ''}${after}`;

    const newLines = [
      ...lines.slice(0, row), // Spread anything before the current line.
      ...valueCopy,
      ...lines.slice(row + 1), // Spread anything after the current line.
    ];
    const newColumn =
      lastIndex === 0
        ? column + value[lastIndex].length
        : value[lastIndex].length;
    const newRow = row + Math.max(0, valueCopy.length - 1);

    return {
      lines: newLines,
      column: newColumn,
      row: newRow,
    };
  }
  return {
    lines: insertAt(lines, insertAt(lines[row], value, column), row),
    column: column + value.length,
  };
}

export function replace({ column, row, lines, value }) {
  const newLine = updateFrom(lines[row], value, column - 1, column);
  return {
    lines: insertAt(lines, newLine, row),
  };
}

export function indent({ column, row, lines, shiftWidth }) {
  const spaces = ''.padStart(shiftWidth, ' ');
  return {
    lines: insertAt(lines, insertAt(lines[row], spaces, column), row),
    column: column + shiftWidth,
  };
}

export function joinLineAbove({ row, lines }) {
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

export function joinLineBelow({ row, column, lines }) {
  if (row === lines.length - 1) {
    return {
      column,
      lines,
      row,
    };
  }
  const line = lines[row];
  const nextLine = lines[row + 1];
  const delimiter =
    line === '' ||
    line[line.length - 1] === ' ' ||
    nextLine === '' ||
    nextLine[0] === ' '
      ? ''
      : ' ';
  const joinedLine = line + delimiter + nextLine;
  const newLines = updateFrom(lines, joinedLine, row, row + 2);
  return {
    row,
    column: lines[row].length,
    lines: newLines,
  };
}

export function removeBefore({ column, row, lines }) {
  const newLine = updateFrom(lines[row], '', column - 1, column);
  const newLines = insertAt(lines, newLine, row);
  return {
    lines: newLines,
    column: column > 0 ? column - 1 : 0,
  };
}

export function remove(options) {
  if (options.column === 0) {
    return joinLineAbove(options);
  }
  return removeBefore(options);
}

export function removeAt({ column, row, lines }) {
  const newLine = updateFrom(lines[row], '', column, column + 1);
  return {
    row,
    column: Math.min(Math.max(0, newLine.length - 1), column),
    lines: insertAt(lines, newLine, row),
  };
}

export function removeFromCursor({ column, row, lines }) {
  const newLine = updateFrom(lines[row], '', column, lines[row].length);
  return {
    lines: insertAt(lines, newLine, row),
  };
}

export function splitLines({ column, row, lines }) {
  const line = lines[row];
  const asTwoLines = [line.substring(0, column), line.substring(column)];
  const newLines = updateFrom(lines, asTwoLines, row, row + 1);
  return {
    lines: newLines,
    column: 0,
    row: row + 1,
  };
}

export function moveAfterEnd({ row, lines }) {
  return {
    column: lines[row].length,
    prevMaxColumn: 0,
  };
}

export function moveDown(options) {
  return options.row < options.lines.length - 1
    ? upOrDown(options, 1)
    : options;
}

export function moveLeft({ column }) {
  return {
    column: column === 0 ? 0 : column - 1,
    prevMaxColumn: 0,
  };
}

export function moveRight({ column, row, lines }) {
  return {
    column: column < lines[row].length - 1 ? column + 1 : column,
    prevMaxColumn: 0,
  };
}

export function moveRightMaybeAfterEnd({ column, row, lines }) {
  if ((column === 0 && lines[row] === '') || column > lines[row].length) {
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

export function moveToFirstNonWhitespace({ row, lines }) {
  return {
    column: lines[row].search(/\S|$/),
    prevMaxColumn: 0,
  };
}

export function moveToStart(options) {
  return {
    ...options,
    column: 0,
    prevMaxColumn: 0,
  };
}

export function moveToEnd({ row, lines }) {
  return {
    column: Math.max(0, lines[row].length - 1),
    prevMaxColumn: 0,
  };
}

export function moveUp(options) {
  return options.row === 0 ? options : upOrDown(options, -1);
}

export function newLineAbove({ row, lines }) {
  return {
    lines: updateFrom(lines, ['', lines[row]], row, row + 1),
    column: 0,
    prevMaxColumn: 0,
  };
}

export function newLineBelow({ row, lines }) {
  return {
    lines: updateFrom(lines, [lines[row], ''], row, row + 1),
    column: 0,
    row: row + 1,
    prevMaxColumn: 0,
  };
}

export function goToFirstLine() {
  return {
    column: 0,
    row: 0,
  };
}

export function goToLastLine({ lines }) {
  return {
    column: 0,
    row: lines.length - 1,
  };
}

export function nextWord({ column, row, lines }) {
  const getNext = (col, offset, newLine = false) => {
    if (typeof lines[row + offset] !== 'string') {
      return { column, row };
    }
    const string = lines[row + offset].substring(col);
    const pattern = newLine > 0 ? /\w/ : /\s\S/;
    const nextWordIndex = string.search(pattern);
    if (nextWordIndex > -1) {
      return {
        column: Math.max(
          0,
          newLine ? nextWordIndex - 1 : nextWordIndex + col + 1,
        ),
        row: row + offset,
        prevMaxColumn: 0,
      };
    }
    return getNext(0, offset + 1, true);
  };
  return getNext(column, 0);
}

function matchingBracketDown({ column, row, lines, cursorChar, oppositeChar }) {
  let sameCharCount = 0;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[row + i];
    if (i === 0) {
      line = line.slice(column + 1);
    }
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === oppositeChar) {
        if (sameCharCount === 0) {
          return {
            column: i === 0 ? j + column + 1 : j,
            row: i + row,
          };
        }
        sameCharCount -= 1;
      } else if (char === cursorChar) {
        sameCharCount += 1;
      }
    }
  }
  return {};
}

function matchingBracketUp({ column, row, lines, cursorChar, oppositeChar }) {
  let sameCharCount = 0;
  for (let i = row; i > -1; i--) {
    let line = lines[i];
    if (i === row) {
      line = line.slice(0, column);
    }
    for (let j = line.length - 1; j > -1; j--) {
      const char = line[j];
      if (char === oppositeChar) {
        if (sameCharCount === 0) {
          return {
            column: j,
            row: i,
          };
        }
        sameCharCount -= 1;
      } else if (char === cursorChar) {
        sameCharCount += 1;
      }
    }
  }
  return {};
}

export function goToMatchingBracket({ column, row, lines }) {
  const openingChars = '([{';
  const closingChars = ')]}';
  const cursorChar = lines[row][column];
  const args = {
    column,
    row,
    lines,
    cursorChar,
  };
  if (openingChars.includes(cursorChar)) {
    return matchingBracketDown({
      ...args,
      oppositeChar: closingChars[openingChars.indexOf(cursorChar)],
    });
  } else if (closingChars.includes(cursorChar)) {
    return matchingBracketUp({
      ...args,
      oppositeChar: openingChars[closingChars.indexOf(cursorChar)],
    });
  }
  return {};
}
