import React from 'react';
import renderer from 'react-test-renderer';

import { Cursor, mapStateToProps } from './index';

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
  };
  const viewId = 1;
  const views = [{
    id: viewId,
    column: 0,
    firstVisibleRow: 0,
    lines: ['a'],
    row: 0,
  }];

  it('should determine whether to render a block or a line based on the mode', () => {
    expect(mapStateToProps({ config, views }, { viewId }).block).toEqual(true);
    expect(mapStateToProps({
      config: {
        ...config,
        mode: 'insert',
      },
      views,
    }, { viewId }).block).toEqual(false);
  });

  it('should show the character under the cursor in normal mode', () => {
    expect(mapStateToProps({ config, views }, { viewId }).character).toEqual('a');
  });

  it('should default to a space if no character is matched in normal mode', () => {
    expect(mapStateToProps({
      config,
      views: [{
        ...views[0],
        column: 1,
      }],
    }, { viewId }).character).toEqual(' ');
  });

  it('should return an empty string for the character in insert mode', () => {
    expect(mapStateToProps({
      config: {
        ...config,
        mode: 'insert',
      },
      views,
    }, { viewId }).character).toEqual('');
  });

  it('should determine a left position based on the column and character width', () => {
    expect(mapStateToProps({ config, views }, { viewId }).left).toEqual(0);
    expect(mapStateToProps({
      config: {
        ...config,
        charWidth: 7,
      },
      views: [{
        ...views[0],
        column: 1,
      }],
    }, { viewId }).left).toEqual(7);
  });

  it('should determine a top position based on the row, first visible row and character height', () => {
    expect(mapStateToProps({ config, views }, { viewId }).top).toEqual(0);
    expect(mapStateToProps({
      config: {
        ...config,
        charheight: 20,
      },
      views: [{
        ...views[0],
        row: 1,
        lines: ['a', 'b'],
      }],
    }, { viewId }).top).toEqual(20);
  });

  it('should determine whether to pulsate based on isUserTyping', () => {
    expect(mapStateToProps({ config, views }, { viewId }).pulsate).toEqual(true);
    expect(mapStateToProps({
      config: {
        ...config,
        isUserTyping: true,
      },
      views,
    }, { viewId }).pulsate).toEqual(false);
  });
});
