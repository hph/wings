import userInputMiddleware, {
  attachEventListeners,
  createElement,
} from './user-input';
import * as types from '../types';

describe('createElement', () => {
  it('creates an input element', () => {
    expect(createElement().tagName).toBe('INPUT');
  });

  it('sets various style properties', () => {
    expect(createElement().style._values).toEqual({ // eslint-disable-line no-underscore-dangle
      position: 'absolute',
      top: '-1000px',
      opacity: '0',
    });
  });

  it('should append the input to the body', () => {
    const element = createElement();
    expect(document.body.children[document.body.children.length - 1]).toBe(element);
  });
});

describe('attachEventListeners', () => {
  describe('blur', () => {
    it('focuses the passed element', () => {
      const element = createElement();
      element.focus = jest.fn();
      attachEventListeners(element);

      expect(element.focus).toHaveBeenCalled();
    });

    it('attaches a blur event listener to focus the element automatically', () => {
      const element = createElement();
      element.addEventListener = jest.fn();
      attachEventListeners(element);

      expect(element.addEventListener).toHaveBeenCalledWith('blur', element.focus);
    });
  });

  const attachWithHandlers = () => {
    const element = createElement();
    element.addEventListener = jest.fn();
    const dispatch = jest.fn();
    attachEventListeners(element, dispatch);
    const handlers = {};
    element.addEventListener.mock.calls.forEach(args => {
      const [event, handler] = args;
      handlers[event] = handler;
    });
    return { handlers, dispatch };
  };

  describe('keydown', () => {
    it('attaches a keydown event listener on the element', () => {
      const { handlers } = attachWithHandlers();

      expect(handlers.keydown).toBeDefined();
    });

    it('returns when a combination of Meta and v where pressed (paste)', () => {
      const { handlers } = attachWithHandlers();
      const preventDefault = jest.fn();
      handlers.keydown({
        preventDefault,
        metaKey: true,
        key: 'v',
      });

      // preventDefault is called immediately after this check otherwise.
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('should call preventDefault when receiving', () => {
      const { handlers } = attachWithHandlers();
      const preventDefault = jest.fn();
      handlers.keydown({
        preventDefault,
        key: 'a',
      });

      expect(preventDefault).toHaveBeenCalled();
    });

    it('should dispatch a value and modifiers when not composing keys and when the key is not Dead', () => {
      const { handlers, dispatch } = attachWithHandlers();
      const preventDefault = jest.fn();

      handlers.keydown({
        preventDefault,
        key: 'a',
      });
      expect(dispatch).toHaveBeenCalledWith({
        replacePrevious: false,
        type: types.USER_INPUT,
        value: 'a',
      });

      handlers.keydown({
        preventDefault,
        key: 'k',
        metaKey: true,
      });
      expect(dispatch).toHaveBeenCalledWith({
        replacePrevious: false,
        type: types.USER_INPUT,
        value: 'k',
        metaKey: true,
      });
    });

    it('should should not do anything when not composing and the key is Dead', () => {
      const { handlers, dispatch } = attachWithHandlers();
      const preventDefault = jest.fn();
      handlers.keydown({
        preventDefault,
        isComposing: false,
        key: 'Dead',
      });
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('paste', () => {
    it('attaches a paste event listener on the element', () => {
      const { handlers } = attachWithHandlers();

      expect(handlers.paste).toBeDefined();
    });

    it('calls dispatch with data from the passed event', () => {
      const { handlers, dispatch } = attachWithHandlers();
      const getData = jest.fn();
      handlers.paste({
        clipboardData: {
          getData,
        },
      });

      expect(dispatch).toHaveBeenCalledWith({
        type: types.USER_INPUT,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        replacePrevious: false,
        value: undefined,
      });
      expect(getData).toHaveBeenCalledWith('text');
    });
  });

  describe('compositionupdate', () => {
    const defaults = {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      replacePrevious: false,
      shiftKey: false,
      type: types.USER_INPUT,
    };

    it('attaches a compositionupdate event listener on the element', () => {
      const { handlers } = attachWithHandlers();

      expect(handlers.compositionupdate).toBeDefined();
    });

    it('dispatches an initial composed value if it was previously empty', () => {
      const { handlers, dispatch } = attachWithHandlers();
      handlers.compositionupdate({ data: 'a' });

      expect(dispatch).toHaveBeenCalledWith({
        ...defaults,
        value: 'a',
      });
    });

    it('does nothing if the received value matches the currently composed value', () => {
      const { handlers, dispatch } = attachWithHandlers();
      handlers.compositionupdate({ data: 'a' });
      handlers.compositionupdate({ data: 'a' });

      expect(dispatch.mock.calls.length).toBe(1);
      expect(dispatch).toHaveBeenCalledWith({
        ...defaults,
        value: 'a',
      });
    });

    it('should reset the composed value to an empty string between compositions', () => {
      const { handlers, dispatch } = attachWithHandlers();
      handlers.compositionupdate({ data: 'a' });
      handlers.compositionupdate({ data: 'a' });
      handlers.compositionupdate({ data: 'b' });

      expect(dispatch.mock.calls.length).toBe(2);
      expect(dispatch).toHaveBeenCalledWith({
        ...defaults,
        value: 'a',
      });
      expect(dispatch).toHaveBeenCalledWith({
        ...defaults,
        value: 'b',
      });
    });

    it('should properly handle simple compositions by replacing the previous character', () => {
      const { handlers, dispatch } = attachWithHandlers();
      handlers.compositionupdate({ data: '´' });
      handlers.compositionupdate({ data: 'á' });

      expect(dispatch.mock.calls.length).toBe(2);
      expect(dispatch).toHaveBeenCalledWith({
        ...defaults,
        value: '´',
      });
      expect(dispatch).toHaveBeenCalledWith({
        ...defaults,
        replacePrevious: true,
        value: 'á',
      });
    });

    it('should handle incompatible characters by dispatching them separately', () => {
      const { handlers, dispatch } = attachWithHandlers();
      handlers.compositionupdate({ data: '´' });
      handlers.compositionupdate({ data: '´s' });

      expect(dispatch.mock.calls.length).toBe(2);
      expect(dispatch.mock.calls.length).toBe(2);
      expect(dispatch).toHaveBeenCalledWith({
        ...defaults,
        value: '´',
      });
      expect(dispatch).toHaveBeenCalledWith({
        ...defaults,
        replacePrevious: false,
        value: 's',
      });
    });
  });
});

jest.mock('./handle-user-input', () => jest.fn());

describe('userInputMiddleware', () => {
  const runMiddleware = (action) => {
    // eslint-disable-next-line global-require
    const handleUserInput = require('./handle-user-input');

    const getState = jest.fn();
    const dispatch = jest.fn();
    const next = jest.fn();
    const middleware = userInputMiddleware({ getState, dispatch });
    middleware(next)(action);

    return {
      handleUserInput,
      next,
      action,
      getState,
      dispatch,
    };
  };

  it('delegates to handleUserInput when receiving USER_INPUT actions and resumes', () => {
    const { handleUserInput, action, getState, dispatch, next } = runMiddleware({
      type: types.USER_INPUT,
    });

    expect(handleUserInput).toHaveBeenCalledWith({
      action,
      getState,
      dispatch,
    });
    expect(next).toHaveBeenCalledWith(action);
  });

  // Note: currently does not check that the action does anything in particular.
  it('handles the USER_INPUT_FOCUS action and resumes', () => {
    const { handleUserInput, action, next } = runMiddleware({
      type: types.USER_INPUT_FOCUS,
    });

    expect(handleUserInput).not.toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledWith(action);
  });

  // Note: currently does not check that the action does anything in particular.
  it('handles the USER_INPUT_UNFOCUS action and resumes', () => {
    const { handleUserInput, action, next } = runMiddleware({
      type: types.USER_INPUT_UNFOCUS,
    });

    expect(handleUserInput).not.toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledWith(action);
  });
});
