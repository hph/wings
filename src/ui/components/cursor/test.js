import React from 'react';
import renderer from 'react-test-renderer';

import { Cursor, mapStateToProps } from './index';

jest.mock('ui/utils', () => ({
  computeFontDimensions: jest.fn(() => ({ width: 5, height: 21 })),
}));

describe('Cursor', () => {
  const createSnapshot = (passedProps = {}) => {
    const props = {
      block: true,
      character: ' ',
      left: 0,
      pulsate: false,
      top: 0,
      ...passedProps,
    };
    expect(renderer.create(<Cursor {...props} />).toJSON()).toMatchSnapshot();
  };

  it('should render with inline styles for positioning', () => {
    createSnapshot();
  });

  it('should not have a "block" class if block is false', () => {
    createSnapshot({
      block: false,
    });
  });

  it('should have a "pulsate" class when pulsate is set and block is false', () => {
    createSnapshot({
      pulsate: true,
      block: false,
    });
  });

  it('should render the provided character inside the cursor when block is true', () => {
    createSnapshot({
      character: 'a',
      block: true,
    });
  });
});

describe('Cursor mapStateToProps', () => {
  const config = {
    charHeight: 20,
    charWidth: 5,
    isUserTyping: false,
    mode: 'normal',
    theme: {},
  };
  const paneId = 1;
  const panes = [{
    id: paneId,
    column: 0,
    firstVisibleRow: 0,
    lines: ['a'],
    row: 0,
  }];

  it('should determine whether to render a block or a line based on the mode', () => {
    expect(mapStateToProps({ config, panes }, { paneId }).block).toEqual(true);
    expect(mapStateToProps({
      config: {
        ...config,
        mode: 'insert',
      },
      panes,
    }, { paneId }).block).toEqual(false);
  });

  it('should show the character under the cursor in normal mode', () => {
    expect(mapStateToProps({ config, panes }, { paneId }).character).toEqual('a');
  });

  it('should default to a space if no character is matched in normal mode', () => {
    expect(mapStateToProps({
      config,
      panes: [{
        ...panes[0],
        column: 1,
      }],
    }, { paneId }).character).toEqual(' ');
  });

  it('should return an empty string for the character in insert mode', () => {
    expect(mapStateToProps({
      config: {
        ...config,
        mode: 'insert',
      },
      panes,
    }, { paneId }).character).toEqual('');
  });

  it('should determine a left position based on the column and character width', () => {
    expect(mapStateToProps({ config, panes }, { paneId }).left).toEqual(0);

    expect(mapStateToProps({
      config,
      panes: [{
        ...panes[0],
        column: 1,
      }],
    }, { paneId }).left).toEqual(5);

    expect(mapStateToProps({
      config,
      panes: [{
        ...panes[0],
        column: 2,
      }],
    }, { paneId }).left).toEqual(10);
  });

  it('should determine a top position based on the row, first visible row and character height', () => {
    expect(mapStateToProps({ config, panes }, { paneId }).top).toEqual(0);

    expect(mapStateToProps({
      config,
      panes: [{
        ...panes[0],
        row: 1,
        lines: ['a', 'b'],
      }],
    }, { paneId }).top).toEqual(21);

    expect(mapStateToProps({
      config,
      panes: [{
        ...panes[0],
        row: 2,
        lines: ['a', 'b', 'c'],
      }],
    }, { paneId }).top).toEqual(42);
  });

  it('should determine whether to pulsate based on isUserTyping', () => {
    expect(mapStateToProps({ config, panes }, { paneId }).pulsate).toEqual(true);
    expect(mapStateToProps({
      config: {
        ...config,
        isUserTyping: true,
      },
      panes,
    }, { paneId }).pulsate).toEqual(false);
  });
});
