import cursorPositionMiddleware from './cursor-position';
import * as types from '../types';

describe('cursorPositionMiddleware', () => {
  const runMiddleware = (providedGetState) => {
    const next = jest.fn();
    const getState = providedGetState || (() => ({ config: {}, views: [] }));
    const action = { type: types.UPDATE_VIEW };
    const middleware = cursorPositionMiddleware({ getState });
    return {
      next,
      getState,
      action,
      middleware,
    };
  };

  it('ignores non-UPDATE_VIEW actions by calling the next middleware', () => {
    const { next, middleware } = runMiddleware();
    const action = { type: 'NOT_UPDATE_VIEW' };
    middleware(next)(action);

    expect(next).toHaveBeenCalledWith(action);
  });

  it('calls the next middleware if there is no current view', () => {
    const { next, action, middleware } = runMiddleware();
    middleware(next)(action);

    expect(next).toHaveBeenCalledWith(action);
  });

  it('calls the next middleware if the action id does not match the current view', () => {
    const currentViewId = 1;
    const getState = () => ({
      config: { currentViewId },
      views: [{ id: currentViewId }],
    });
    const action = {
      type: types.UPDATE_VIEW,
      id: 2,
    };
    const { next, middleware } = runMiddleware(getState);
    middleware(next)(action);

    expect(next).toHaveBeenCalledWith(action);
  });

  it('calls the next middleware if the row and column in the action and view are the same', () => {
    const currentViewId = 1;
    const getState = () => ({
      config: { currentViewId },
      views: [{
        id: currentViewId,
        column: 0,
        row: 0,
        // This ensures that the test fails if next is not called before
        // all the computations, since new action will be returned.
        firstVisibleRow: 100,
      }],
    });
    const next = jest.fn();
    const action = {
      type: types.UPDATE_VIEW,
      id: currentViewId,
      column: 0,
      row: 0,
    };
    const middleware = cursorPositionMiddleware({ getState });
    middleware(next)(action);

    expect(next).toHaveBeenCalledWith(action);
  });

  it('should update the firstVisibleRow if it is smaller in the action than the view', () => {
    const currentViewId = 1;
    const getState = () => ({
      config: {
        currentViewId,
        isTitleBarVisible: false,
        charHeight: 20,
      },
      views: [{
        id: currentViewId,
        column: 0,
        row: 10,
        firstVisibleRow: 10,
        height: 800,
      }],
    });
    const next = jest.fn();
    const action = {
      type: types.UPDATE_VIEW,
      id: currentViewId,
      column: 0,
      row: 0,
    };
    const middleware = cursorPositionMiddleware({ getState });
    middleware(next)(action);

    expect(next).toHaveBeenCalledWith({
      ...action,
      firstVisibleRow: action.row,
    });
  });

  it('should update the firstVisibleRow if the action row is larger than the last visible row', () => {
    const currentViewId = 1;
    const getState = () => ({
      config: {
        currentViewId,
        isTitleBarVisible: false,
        charHeight: 20,
      },
      views: [{
        id: currentViewId,
        column: 0,
        row: 10,
        firstVisibleRow: 0,
        height: 800,
      }],
    });
    const next = jest.fn();
    const action = {
      type: types.UPDATE_VIEW,
      id: currentViewId,
      column: 0,
      row: 100,
      firstVisibleRow: 10,
    };
    const middleware = cursorPositionMiddleware({ getState });
    middleware(next)(action);

    expect(next).toHaveBeenCalledWith({
      ...action,
      firstVisibleRow: 61,
    });
  });

  it('should calculate the height differently if the titlebar is visible', () => {
    const currentViewId = 1;
    const getState = () => ({
      config: {
        currentViewId,
        isTitleBarVisible: true,
        charHeight: 20,
        theme: {
          titleBarHeight: 23,
        },
      },
      views: [{
        id: currentViewId,
        column: 0,
        row: 10,
        firstVisibleRow: 0,
        height: 800,
      }],
    });
    const next = jest.fn();
    const action = {
      type: types.UPDATE_VIEW,
      id: currentViewId,
      column: 0,
      row: 100,
      firstVisibleRow: 10,
    };
    const middleware = cursorPositionMiddleware({ getState });
    middleware(next)(action);

    expect(next).toHaveBeenCalledWith({
      ...action,
      firstVisibleRow: 63,
    });
  });

  it('should update the first visible column if it is smaller in the action than the view', () => {
    const currentViewId = 1;
    const getState = () => ({
      config: {
        currentViewId,
        charWidth: 5,
      },
      views: [{
        id: currentViewId,
        column: 10,
        row: 0,
        firstVisibleColumn: 10,
        width: 600,
      }],
    });
    const next = jest.fn();
    const action = {
      type: types.UPDATE_VIEW,
      id: currentViewId,
      column: 0,
      row: 100,
    };
    const middleware = cursorPositionMiddleware({ getState });
    middleware(next)(action);

    expect(next).toHaveBeenCalledWith({
      ...action,
      firstVisibleColumn: 0,
    });
  });

  it('should update the first visible column if it is larger in the action than the last visible column', () => {
    const currentViewId = 1;
    const getState = () => ({
      config: {
        currentViewId,
        charWidth: 5,
      },
      views: [{
        id: currentViewId,
        column: 10,
        row: 0,
        firstVisibleColumn: 0,
        width: 600,
      }],
    });
    const next = jest.fn();
    const action = {
      type: types.UPDATE_VIEW,
      id: currentViewId,
      column: 200,
      row: 100,
    };
    const middleware = cursorPositionMiddleware({ getState });
    middleware(next)(action);

    expect(next).toHaveBeenCalledWith({
      ...action,
      firstVisibleColumn: 81,
    });
  });
});
