import * as commands from './commands';

describe('insert', () => {
  it('should not do anything when inserting an empty value', () => {
    expect(
      commands.insert({
        column: 0,
        row: 0,
        lines: [''],
        value: '',
      }),
    ).toEqual({
      column: 0,
      lines: [''],
    });

    expect(
      commands.insert({
        column: 2,
        row: 0,
        lines: ['hello'],
        value: '',
      }),
    ).toEqual({
      column: 2,
      lines: ['hello'],
    });

    expect(
      commands.insert({
        column: 2,
        row: 0,
        lines: ['hello', 'friend'],
        value: '',
      }),
    ).toEqual({
      column: 2,
      lines: ['hello', 'friend'],
    });
  });

  it('should update the column and lines when inserting a single character', () => {
    expect(
      commands.insert({
        column: 0,
        row: 0,
        lines: [''],
        value: 'a',
      }),
    ).toEqual({
      column: 1,
      lines: ['a'],
    });

    expect(
      commands.insert({
        column: 2,
        row: 0,
        lines: ['hello'],
        value: 'a',
      }),
    ).toEqual({
      column: 3,
      lines: ['heallo'],
    });

    expect(
      commands.insert({
        column: 2,
        row: 1,
        lines: ['hello', 'friend'],
        value: 'a',
      }),
    ).toEqual({
      column: 3,
      lines: ['hello', 'fraiend'],
    });
  });

  it('should update the column and lines when inserting multiple characters', () => {
    expect(
      commands.insert({
        column: 0,
        row: 0,
        lines: [''],
        value: 'abc',
      }),
    ).toEqual({
      column: 3,
      lines: ['abc'],
    });

    expect(
      commands.insert({
        column: 2,
        row: 0,
        lines: ['hello'],
        value: 'abc',
      }),
    ).toEqual({
      column: 5,
      lines: ['heabcllo'],
    });

    expect(
      commands.insert({
        column: 2,
        row: 1,
        lines: ['hello', 'friend'],
        value: 'abc',
      }),
    ).toEqual({
      column: 5,
      lines: ['hello', 'frabciend'],
    });
  });

  describe('with an array value', () => {
    it('should not do anything for empty current and new values', () => {
      const original = {
        column: 0,
        row: 0,
        lines: [''],
      };
      expect(
        commands.insert({
          ...original,
          value: [''],
        }),
      ).toEqual(original);
    });

    it('should not do anything for an empty new value after a non-empty value', () => {
      const original = {
        column: 6,
        row: 1,
        lines: ['hello', 'world!'],
      };
      expect(
        commands.insert({
          ...original,
          value: [''],
        }),
      ).toEqual(original);
    });

    it('should insert a non-empty value after an empty value', () => {
      expect(
        commands.insert({
          column: 0,
          row: 0,
          lines: [''],
          value: ['hello', 'world!'],
        }),
      ).toEqual({
        column: 6,
        row: 1,
        lines: ['hello', 'world!'],
      });
    });

    it('should handle single-item values properly', () => {
      expect(
        commands.insert({
          column: 5,
          row: 0,
          lines: ['hi, ""!'],
          value: ['Wings'],
        }),
      ).toEqual({
        column: 10,
        row: 0,
        lines: ['hi, "Wings"!'],
      });

      expect(
        commands.insert({
          column: 5,
          row: 1,
          lines: ['hello', 'so, "" is my name!'],
          value: ['wings'],
        }),
      ).toEqual({
        column: 10,
        row: 1,
        lines: ['hello', 'so, "wings" is my name!'],
      });

      expect(
        commands.insert({
          column: 5,
          row: 1,
          lines: ['hello', 'so, "" is my name!', 'right?'],
          value: ['wings'],
        }),
      ).toEqual({
        column: 10,
        row: 1,
        lines: ['hello', 'so, "wings" is my name!', 'right?'],
      });
    });

    it('should insert a multi-line value', () => {
      expect(
        commands.insert({
          column: 0,
          row: 0,
          lines: ['this is not so hard'],
          value: ['hello', 'world!', ''],
        }),
      ).toEqual({
        column: 0,
        row: 2,
        lines: ['hello', 'world!', 'this is not so hard'],
      });

      expect(
        commands.insert({
          column: 1,
          row: 1,
          lines: ['this is', 'a bit', 'more complex'],
          value: ['hello', 'world!'],
        }),
      ).toEqual({
        column: 6,
        row: 2,
        lines: ['this is', 'ahello', 'world! bit', 'more complex'],
      });

      expect(
        commands.insert({
          column: 6,
          row: 1,
          lines: ['it all', 'seems '],
          value: ['to', 'kind of', 'work!'],
        }),
      ).toEqual({
        column: 5,
        row: 3,
        lines: ['it all', 'seems to', 'kind of', 'work!'],
      });
    });
  });
});

describe('indent', () => {
  it('should indent the line as determined by shiftWidth', () => {
    expect(
      commands.indent({
        column: 0,
        row: 0,
        lines: ['hello'],
        shiftWidth: 2,
      }),
    ).toEqual({
      lines: ['  hello'],
      column: 2,
    });

    expect(
      commands.indent({
        column: 0,
        row: 0,
        lines: ['hello', 'world!'],
        shiftWidth: 4,
      }),
    ).toEqual({
      lines: ['    hello', 'world!'],
      column: 4,
    });

    expect(
      commands.indent({
        column: 2,
        row: 0,
        lines: ['hello', 'world!'],
        shiftWidth: 2,
      }),
    ).toEqual({
      lines: ['he  llo', 'world!'],
      column: 4,
    });
  });
});

describe('replace', () => {
  it('should replace the previous character when given a single character value', () => {
    expect(
      commands.replace({
        column: 0,
        row: 0,
        lines: [''],
        value: 'a',
      }),
    ).toEqual({
      lines: ['a'],
    });

    expect(
      commands.replace({
        column: 2,
        row: 0,
        lines: ['hello'],
        value: 'a',
      }),
    ).toEqual({
      lines: ['hallo'],
    });

    expect(
      commands.replace({
        column: 2,
        row: 1,
        lines: ['hello', 'friend'],
        value: 'a',
      }),
    ).toEqual({
      lines: ['hello', 'faiend'],
    });
  });
});

describe('joinLineAbove', () => {
  it('should not do anything at all on the first line', () => {
    const input1 = {
      row: 0,
      lines: [''],
    };
    const input2 = {
      row: 0,
      lines: ['a', 'b', 'c'],
    };
    expect(commands.joinLineAbove(input1)).toEqual(input1);
    expect(commands.joinLineAbove(input2)).toEqual(input2);
  });

  it('should merge the current line with the previous line', () => {
    expect(
      commands.joinLineAbove({
        row: 1,
        lines: ['a', 'b', 'c'],
      }),
    ).toEqual({
      column: 1,
      lines: ['ab', 'c'],
      row: 0,
    });

    expect(
      commands.joinLineAbove({
        row: 2,
        lines: ['a', 'b', 'c'],
      }),
    ).toEqual({
      column: 1,
      row: 1,
      lines: ['a', 'bc'],
    });
  });
});

describe('joinLineBelow', () => {
  it('should not do anything at all on the last line', () => {
    const input1 = {
      row: 0,
      lines: [''],
    };
    const input2 = {
      row: 2,
      lines: ['a', 'b', 'c'],
    };
    expect(commands.joinLineBelow(input1)).toEqual(input1);
    expect(commands.joinLineBelow(input2)).toEqual(input2);
  });

  it('should merge the current line with the next line', () => {
    expect(
      commands.joinLineBelow({
        lines: ['a', 'b', 'c'],
        row: 0,
      }),
    ).toEqual({
      column: 1,
      row: 0,
      lines: ['a b', 'c'],
    });

    expect(
      commands.joinLineBelow({
        lines: ['a', 'b', 'c'],
        row: 1,
      }),
    ).toEqual({
      column: 1,
      row: 1,
      lines: ['a', 'b c'],
    });
  });

  it('should not add a delimiter for empty lines or when there is one already', () => {
    expect(
      commands.joinLineBelow({
        lines: ['', '', ''],
        row: 0,
      }),
    ).toEqual({
      column: 0,
      row: 0,
      lines: ['', ''],
    });

    expect(
      commands.joinLineBelow({
        lines: ['', 'hi'],
        row: 0,
      }),
    ).toEqual({
      column: 0,
      row: 0,
      lines: ['hi'],
    });

    expect(
      commands.joinLineBelow({
        lines: ['hello ', 'world'],
        row: 0,
      }),
    ).toEqual({
      column: 6,
      row: 0,
      lines: ['hello world'],
    });

    expect(
      commands.joinLineBelow({
        lines: ['this', ' is great'],
        row: 0,
      }),
    ).toEqual({
      column: 4,
      row: 0,
      lines: ['this is great'],
    });
  });
});

describe('removeBefore', () => {
  it('should not merge lines when on the first column', () => {
    expect(
      commands.removeBefore({
        column: 0,
        row: 1,
        lines: ['a', 'b', 'c'],
      }),
    ).toEqual({
      column: 0,
      lines: ['a', 'b', 'c'],
    });
  });

  it('should remove previous character before the cursor', () => {
    expect(
      commands.removeBefore({
        column: 1,
        row: 0,
        lines: ['abc'],
      }),
    ).toEqual({
      column: 0,
      lines: ['bc'],
    });

    expect(
      commands.removeBefore({
        column: 1,
        row: 0,
        lines: ['abc'],
      }),
    ).toEqual({
      column: 0,
      lines: ['bc'],
    });
  });
});

describe('remove', () => {
  it('should not do anything in the first column of the first line', () => {
    expect(
      commands.remove({
        column: 0,
        lines: [''],
        row: 0,
      }),
    ).toEqual({
      lines: [''],
      row: 0,
    });

    expect(
      commands.remove({
        column: 0,
        row: 0,
        lines: ['hello', 'world'],
      }),
    ).toEqual({
      lines: ['hello', 'world'],
      row: 0,
    });
  });

  it('should merge lines in the first column of all subsequent lines', () => {
    expect(
      commands.remove({
        column: 0,
        row: 1,
        lines: ['a', 'b', 'c'],
      }),
    ).toEqual({
      column: 1,
      row: 0,
      lines: ['ab', 'c'],
    });

    expect(
      commands.remove({
        column: 0,
        row: 1,
        lines: ['hi', 'there'],
      }),
    ).toEqual({
      column: 2,
      row: 0,
      lines: ['hithere'],
    });
  });

  it('should remove the character before the cursor', () => {
    expect(
      commands.remove({
        column: 1,
        row: 0,
        lines: ['abc'],
      }),
    ).toEqual({
      column: 0,
      lines: ['bc'],
    });

    expect(
      commands.remove({
        column: 1,
        row: 0,
        lines: ['abc'],
      }),
    ).toEqual({
      column: 0,
      lines: ['bc'],
    });
  });
});

describe('removeAt', () => {
  it('should not do anything on an empty line', () => {
    expect(
      commands.removeAt({
        column: 0,
        row: 0,
        lines: [''],
      }).lines,
    ).toEqual(['']);
  });

  it('should remove the character under the cursor', () => {
    expect(
      commands.removeAt({
        column: 0,
        row: 0,
        lines: ['hello'],
      }),
    ).toEqual({
      column: 0,
      row: 0,
      lines: ['ello'],
    });

    expect(
      commands.removeAt({
        column: 1,
        row: 0,
        lines: ['hello'],
      }),
    ).toEqual({
      column: 1,
      row: 0,
      lines: ['hllo'],
    });
  });
});

describe('removeFromCursor', () => {
  it('should not do anything if on the last character', () => {
    expect(
      commands.removeFromCursor({
        column: 0,
        row: 0,
        lines: [''],
      }),
    ).toEqual({
      lines: [''],
    });

    expect(
      commands.removeFromCursor({
        column: 5,
        row: 0,
        lines: ['hello'],
      }),
    ).toEqual({
      lines: ['hello'],
    });

    expect(
      commands.removeFromCursor({
        column: 5,
        row: 0,
        lines: ['hello', 'world'],
      }),
    ).toEqual({
      lines: ['hello', 'world'],
    });
  });

  it('should delete from the cursor to the end of the line', () => {
    expect(
      commands.removeFromCursor({
        column: 0,
        row: 0,
        lines: ['hello'],
      }),
    ).toEqual({
      lines: [''],
    });

    expect(
      commands.removeFromCursor({
        column: 2,
        row: 0,
        lines: ['hello'],
      }),
    ).toEqual({
      lines: ['he'],
    });

    expect(
      commands.removeFromCursor({
        column: 2,
        row: 0,
        lines: ['hello', 'world'],
      }),
    ).toEqual({
      lines: ['he', 'world'],
    });
  });
});

describe('splitLines', () => {
  it('should split the current line in two', () => {
    expect(
      commands.splitLines({
        column: 0,
        row: 0,
        lines: [''],
      }),
    ).toEqual({
      column: 0,
      row: 1,
      lines: ['', ''],
    });

    expect(
      commands.splitLines({
        column: 2,
        row: 0,
        lines: ['hello'],
      }),
    ).toEqual({
      column: 0,
      row: 1,
      lines: ['he', 'llo'],
    });

    expect(
      commands.splitLines({
        column: 2,
        row: 0,
        lines: ['hello', 'world'],
      }),
    ).toEqual({
      column: 0,
      row: 1,
      lines: ['he', 'llo', 'world'],
    });
  });
});

describe('moveAfterEnd', () => {
  it('should update the column to be equivalent to the line length', () => {
    expect(
      commands.moveAfterEnd({
        row: 0,
        lines: [''],
      }).column,
    ).toEqual(0);

    expect(
      commands.moveAfterEnd({
        row: 0,
        lines: ['a'],
      }).column,
    ).toEqual(1);

    expect(
      commands.moveAfterEnd({
        row: 0,
        lines: ['abc'],
      }).column,
    ).toEqual(3);
  });

  it('should always reset prevMaxColumn to zero', () => {
    expect(
      commands.moveAfterEnd({
        row: 0,
        lines: [''],
      }).prevMaxColumn,
    ).toEqual(0);

    expect(
      commands.moveLeft({
        row: 0,
        lines: ['abc'],
      }).prevMaxColumn,
    ).toEqual(0);
  });
});

describe('moveDown', () => {
  it('should not do anything on the last line', () => {
    expect(
      commands.moveDown({
        row: 0,
        lines: [''],
        prevMaxColumn: 0,
      }),
    ).toEqual({
      row: 0,
      lines: [''],
      prevMaxColumn: 0,
    });

    expect(
      commands.moveDown({
        row: 2,
        lines: ['a', 'b', 'c'],
        prevMaxColumn: 0,
      }),
    ).toEqual({
      row: 2,
      lines: ['a', 'b', 'c'],
      prevMaxColumn: 0,
    });
  });

  it('should move down by one line', () => {
    expect(
      commands.moveDown({
        row: 0,
        lines: ['a', 'b', 'c'],
        prevMaxColumn: 0,
      }),
    ).toEqual({
      column: 0,
      row: 1,
      prevMaxColumn: 0,
    });

    expect(
      commands.moveDown({
        row: 1,
        lines: ['a', 'b', 'c'],
        prevMaxColumn: 0,
      }),
    ).toEqual({
      row: 2,
      column: 0,
      prevMaxColumn: 0,
    });
  });

  it('should keep the larger prevMaxColumn value', () => {
    expect(
      commands.moveDown({
        column: 5,
        row: 0,
        lines: ['hello, world!', '', 'abc'],
        prevMaxColumn: 5,
      }),
    ).toEqual({
      column: 0,
      row: 1,
      prevMaxColumn: 5,
    });
  });
});

describe('moveLeft', () => {
  it('should not move to the left when already on the leftmost column', () => {
    expect(
      commands.moveLeft({
        column: 0,
      }).column,
    ).toEqual(0);
  });

  it('should move to the left', () => {
    expect(
      commands.moveLeft({
        column: 1,
      }).column,
    ).toEqual(0);
  });

  it('should always reset prevMaxColumn to zero', () => {
    expect(
      commands.moveLeft({
        column: 0,
      }),
    ).toEqual({
      column: 0,
      prevMaxColumn: 0,
    });

    expect(
      commands.moveLeft({
        column: 1,
      }),
    ).toEqual({
      column: 0,
      prevMaxColumn: 0,
    });
  });
});

describe('moveRight', () => {
  it('should not move to the right when already on the rightmost column', () => {
    expect(
      commands.moveRight({
        column: 0,
        row: 0,
        lines: [''],
      }).column,
    ).toEqual(0);

    expect(
      commands.moveRight({
        column: 2,
        row: 0,
        lines: ['abc'],
      }).column,
    ).toEqual(2);
  });

  it('should move to the right', () => {
    expect(
      commands.moveRight({
        column: 0,
        row: 0,
        lines: ['abc'],
      }).column,
    ).toEqual(1);
  });

  it('should always reset prevMaxColumn to zero', () => {
    expect(
      commands.moveRight({
        column: 0,
        row: 0,
        lines: [''],
      }),
    ).toEqual({
      column: 0,
      prevMaxColumn: 0,
    });

    expect(
      commands.moveRight({
        column: 0,
        row: 0,
        lines: ['hi'],
      }),
    ).toEqual({
      column: 1,
      prevMaxColumn: 0,
    });
  });
});

describe('moveRightMaybeAfterEnd', () => {
  it('should move right', () => {
    expect(
      commands.moveRightMaybeAfterEnd({
        column: 0,
        row: 0,
        lines: ['hello'],
      }).column,
    ).toEqual(1);
  });

  it('should move right after the last column', () => {
    expect(
      commands.moveRightMaybeAfterEnd({
        column: 5,
        row: 0,
        lines: ['hello'],
      }).column,
    ).toEqual(6);
  });

  it('should not move right if the line is empty or the column is larger than the line length', () => {
    expect(
      commands.moveRightMaybeAfterEnd({
        column: 0,
        row: 0,
        lines: [''],
      }).column,
    ).toEqual(0);

    expect(
      commands.moveRightMaybeAfterEnd({
        column: 6,
        row: 0,
        lines: ['hello'],
      }).column,
    ).toEqual(6);
  });

  it('should always reset prevMaxColumn to zero', () => {
    expect(
      commands.moveRightMaybeAfterEnd({
        column: 0,
        row: 0,
        lines: [''],
      }).prevMaxColumn,
    ).toEqual(0);

    expect(
      commands.moveRightMaybeAfterEnd({
        column: 2,
        row: 0,
        lines: ['hello'],
      }).prevMaxColumn,
    ).toEqual(0);
  });
});

describe('moveToFirstNonWhitespace', () => {
  it('should not move on an empty line', () => {
    expect(
      commands.moveToFirstNonWhitespace({
        row: 0,
        lines: [''],
      }).column,
    ).toEqual(0);
  });

  it('should move to the first non-whitespace character in the line', () => {
    expect(
      commands.moveToFirstNonWhitespace({
        row: 0,
        lines: ['hello'],
      }).column,
    ).toEqual(0);

    expect(
      commands.moveToFirstNonWhitespace({
        row: 0,
        lines: [' hello'],
      }).column,
    ).toEqual(1);

    expect(
      commands.moveToFirstNonWhitespace({
        column: 5,
        row: 0,
        lines: [' hello'],
      }).column,
    ).toEqual(1);

    expect(
      commands.moveToFirstNonWhitespace({
        column: 5,
        row: 0,
        lines: [' hello'],
      }).column,
    ).toEqual(1);
  });

  it('should always reset prevMaxColumn to zero', () => {
    expect(
      commands.moveToFirstNonWhitespace({
        row: 0,
        lines: [''],
      }).prevMaxColumn,
    ).toEqual(0);

    expect(
      commands.moveToFirstNonWhitespace({
        row: 0,
        lines: [' hello'],
      }).prevMaxColumn,
    ).toEqual(0);
  });
});

describe('moveToStart', () => {
  it('should always move to the first column of the line', () => {
    expect(commands.moveToStart().column).toEqual(0);

    expect(commands.moveToStart({ column: 2 }).column).toEqual(0);
  });

  it('should always reset prevMaxColumn to zero', () => {
    expect(commands.moveToStart().prevMaxColumn).toEqual(0);

    expect(commands.moveToStart({ column: 2 }).prevMaxColumn).toEqual(0);
  });
});

describe('moveToEnd', () => {
  it('should always move to the last column of the line', () => {
    expect(
      commands.moveToEnd({
        row: 0,
        lines: [''],
      }).column,
    ).toEqual(0);

    expect(
      commands.moveToEnd({
        row: 0,
        lines: ['abc'],
      }).column,
    ).toEqual(2);
  });

  it('should always reset prevMaxColumn to zero', () => {
    expect(
      commands.moveToEnd({
        row: 0,
        lines: [''],
      }).prevMaxColumn,
    ).toEqual(0);

    expect(
      commands.moveToEnd({
        row: 0,
        lines: ['abc'],
      }).prevMaxColumn,
    ).toEqual(0);
  });
});

describe('moveUp', () => {
  it('should not do anything on the first line', () => {
    expect(
      commands.moveUp({
        row: 0,
        lines: [''],
        prevMaxColumn: 0,
      }),
    ).toEqual({
      row: 0,
      lines: [''],
      prevMaxColumn: 0,
    });

    expect(
      commands.moveUp({
        row: 0,
        lines: ['a', 'b', 'c'],
        prevMaxColumn: 0,
      }),
    ).toEqual({
      row: 0,
      lines: ['a', 'b', 'c'],
      prevMaxColumn: 0,
    });
  });

  it('should move up by one line', () => {
    expect(
      commands.moveUp({
        row: 1,
        lines: ['a', 'b', 'c'],
        prevMaxColumn: 0,
      }),
    ).toEqual({
      column: 0,
      row: 0,
      prevMaxColumn: 0,
    });

    expect(
      commands.moveUp({
        row: 2,
        lines: ['a', 'b', 'c'],
        prevMaxColumn: 0,
      }),
    ).toEqual({
      row: 1,
      column: 0,
      prevMaxColumn: 0,
    });
  });
});

describe('newLineAbove', () => {
  it('should create an empty line above the current line', () => {
    expect(
      commands.newLineAbove({
        row: 0,
        lines: [''],
      }),
    ).toEqual({
      lines: ['', ''],
      column: 0,
      prevMaxColumn: 0,
    });

    expect(
      commands.newLineAbove({
        row: 1,
        lines: ['hello', 'world'],
      }),
    ).toEqual({
      lines: ['hello', '', 'world'],
      column: 0,
      prevMaxColumn: 0,
    });
  });

  it('should always reset prevMaxColumn to zero', () => {
    expect(
      commands.newLineBelow({
        row: 0,
        lines: [''],
      }).prevMaxColumn,
    ).toEqual(0);
  });
});

describe('newLineBelow', () => {
  it('should create an empty line below the current line', () => {
    expect(
      commands.newLineBelow({
        row: 0,
        lines: [''],
      }),
    ).toEqual({
      lines: ['', ''],
      column: 0,
      row: 1,
      prevMaxColumn: 0,
    });

    expect(
      commands.newLineBelow({
        row: 0,
        lines: ['hello', 'world'],
      }),
    ).toEqual({
      lines: ['hello', '', 'world'],
      column: 0,
      row: 1,
      prevMaxColumn: 0,
    });
  });

  it('should always reset prevMaxColumn to zero', () => {
    expect(
      commands.newLineBelow({
        row: 0,
        lines: [''],
      }).prevMaxColumn,
    ).toEqual(0);
  });
});

describe('goToFirstLine', () => {
  it('should always return the first line and column', () => {
    expect(commands.goToFirstLine()).toEqual({
      column: 0,
      row: 0,
    });

    expect(commands.goToFirstLine()).toEqual({
      column: 0,
      row: 0,
    });
  });
});

describe('goToLastLine', () => {
  it('should always return the last line and first column', () => {
    expect(
      commands.goToLastLine({
        lines: [''],
      }),
    ).toEqual({
      column: 0,
      row: 0,
    });

    expect(
      commands.goToLastLine({
        lines: ['a', 'b', 'c'],
      }),
    ).toEqual({
      column: 0,
      row: 2,
    });
  });
});

describe('nextWord', () => {
  it('should move to the next word', () => {
    expect(
      commands.nextWord({
        column: 0,
        row: 0,
        lines: ['hello, world.', 'what is up?'],
      }),
    ).toEqual({
      column: 7,
      row: 0,
      prevMaxColumn: 0,
    });

    expect(
      commands.nextWord({
        column: 7,
        row: 0,
        lines: ['hello, world.', 'what is up?'],
      }),
    ).toEqual({
      column: 0,
      row: 1,
      prevMaxColumn: 0,
    });
  });

  it('should not do anything if already on the last word', () => {
    expect(
      commands.nextWord({
        column: 0,
        row: 0,
        lines: [''],
      }),
    ).toEqual({
      column: 0,
      row: 0,
    });

    expect(
      commands.nextWord({
        column: 8,
        row: 1,
        lines: ['hello, world.', 'what is up?'],
      }),
    ).toEqual({
      column: 8,
      row: 1,
    });
  });

  it('should reset prevMaxColumn to zero', () => {
    expect(
      commands.nextWord({
        column: 2,
        row: 0,
        lines: ['hello, world.', 'what is up?'],
        prevMaxColumn: 2,
      }).prevMaxColumn,
    ).toEqual(0);
  });
});

describe('goToMatchingBracket', () => {
  it('should not do anything when not on a bracket', () => {
    expect(
      commands.goToMatchingBracket({
        lines: ['aa'],
        column: 0,
        row: 0,
      }),
    ).toEqual({});

    expect(
      commands.goToMatchingBracket({
        lines: ['bab'],
        column: 2,
        row: 0,
      }),
    ).toEqual({});

    expect(
      commands.goToMatchingBracket({
        lines: ['<a', 'b>'],
        column: 1,
        row: 1,
      }),
    ).toEqual({});
  });

  it('should not do anything if a matching bracket is not found', () => {
    expect(
      commands.goToMatchingBracket({
        lines: ['(oh no!'],
        column: 0,
        row: 0,
      }),
    ).toEqual({});

    expect(
      commands.goToMatchingBracket({
        lines: ['(nope]'],
        column: 0,
        row: 0,
      }),
    ).toEqual({});

    expect(
      commands.goToMatchingBracket({
        lines: ['not (', 'so', 'great'],
        column: 4,
        row: 0,
      }),
    ).toEqual({});

    expect(
      commands.goToMatchingBracket({
        lines: ['nope)'],
        column: 4,
        row: 0,
      }),
    ).toEqual({});
  });

  it('should go to the matching bracket in the same line in both directions', () => {
    expect(
      commands.goToMatchingBracket({
        lines: ['()'],
        column: 0,
        row: 0,
      }),
    ).toEqual({
      column: 1,
      row: 0,
    });

    expect(
      commands.goToMatchingBracket({
        lines: ['(huh?)'],
        column: 0,
        row: 0,
      }),
    ).toEqual({
      column: 5,
      row: 0,
    });

    expect(
      commands.goToMatchingBracket({
        lines: ['()'],
        column: 1,
        row: 0,
      }),
    ).toEqual({
      column: 0,
      row: 0,
    });

    expect(
      commands.goToMatchingBracket({
        lines: ['(wooo)'],
        column: 5,
        row: 0,
      }),
    ).toEqual({
      column: 0,
      row: 0,
    });
  });

  it('should support all the bracket types', () => {
    ['(asdf)', '[asdf]', '{asdf}'].forEach(line => {
      expect(
        commands.goToMatchingBracket({
          lines: [line],
          column: 0,
          row: 0,
        }),
      ).toEqual({
        column: 5,
        row: 0,
      });
    });
  });

  it('should ignore inner matches', () => {
    expect(
      commands.goToMatchingBracket({
        lines: ['function () {', '  if (true) {', '    return;', '  }', '}'],
        column: 12,
        row: 0,
      }),
    ).toEqual({
      column: 0,
      row: 4,
    });

    expect(
      commands.goToMatchingBracket({
        lines: ['foo (', '()', ')'],
        column: 0,
        row: 2,
      }),
    ).toEqual({
      column: 4,
      row: 0,
    });
  });

  it('should go back to the previous position when run twice', () => {
    const lines = ['a ( ', 'b (()', '}', '))', ''];
    const input = {
      column: 2,
      row: 0,
    };

    expect(
      commands.goToMatchingBracket({
        lines,
        ...commands.goToMatchingBracket({
          lines,
          ...input,
        }),
      }),
    ).toEqual(input);
  });
});
