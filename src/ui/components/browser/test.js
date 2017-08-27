import React from 'react';
import renderer from 'react-test-renderer';

import { userInputFocus } from 'ui/state/actions';
import { Browser, withScheme } from './index';

function createNodeMockCreator (methods = {}) {
  return (element) => {
    if (element.type === 'input') {
      return {
        select: () => {},
        ...methods,
      };
    }

    if (element.type === 'webview') {
      return {
        addEventListener: () => {},
        reload: () => {},
        ...methods,
      };
    }

    return null;
  };
}

const defaultProps = {
  dispatch: () => {},
};

const createTree = (props = defaultProps, mockMethods = {}) => {
  const createNodeMock = createNodeMockCreator(mockMethods);
  const component = renderer.create(<Browser {...props} />, { createNodeMock });
  return {
    component,
    tree: component.toJSON(),
  };
};

const createSnapshot = (props = defaultProps, mockMethods = {}) => {
  const { tree } = createTree(props, mockMethods);
  expect(tree).toMatchSnapshot();
};

describe('Browser', () => {
  it('renders a default browser view', () => {
    createSnapshot();
  });

  it('selects the navigation bar on mount', done => {
    const select = jest.fn();
    createTree(defaultProps, { select });

    setTimeout(() => {
      expect(select.mock.calls.length).toBe(1);
      done();
    });
  });

  it('sets up event listeners on mount', () => {
    const addEventListener = jest.fn();
    createTree(defaultProps, { addEventListener });

    expect(addEventListener.mock.calls.length).toBe(3);
    expect(addEventListener.mock.calls[0][0]).toEqual('will-navigate');
    expect(addEventListener.mock.calls[1][0]).toEqual('did-get-redirect-request');
    expect(addEventListener.mock.calls[2][0]).toEqual('did-fail-load');
  });

  it('dispatches an action to stop user input focus on click', () => {
    const dispatch = jest.fn();
    const { tree } = createTree({ ...defaultProps, dispatch });
    tree.children[0].props.onClick();

    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0][0]).toEqual(userInputFocus(false));
  });

  it('updates the value in the navbar as the user types', () => {
    const { component, tree } = createTree();
    expect(tree).toMatchSnapshot();
    tree.children[0].props.onChange({ target: { value: 'example.com' } });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('navigates to the URL in the navbar on an Enter keypress', () => {
    const reload = jest.fn();
    const { component, tree } = createTree(defaultProps, { reload });
    tree.children[0].props.onChange({ target: { value: 'example.com' } });
    tree.children[0].props.onKeyDown({ key: 'Enter' });
    expect(component.toJSON()).toMatchSnapshot();
    expect(reload.mock.calls.length).toBe(0);

    // Browser calls reload when the URL does not change on an enter keypress.
    tree.children[0].props.onKeyDown({ key: 'Enter' });
    expect(reload.mock.calls.length).toBe(1);

    // Non-enter key presses don't do anything.
    tree.children[0].props.onKeyDown({ key: 'a' });
    expect(reload.mock.calls.length).toBe(1);
  });

  it('shows an error on a webview load error', () => {
    let onDidFailLoad;
    const addEventListener = jest.fn((event, callback) => {
      if (event === 'did-fail-load') {
        onDidFailLoad = callback;
      }
    });
    const { component } = createTree(defaultProps, { addEventListener });
    onDidFailLoad({ errorDescription: 'oh no!' });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('withScheme function prepends an HTTP scheme to a string', () => {
    // Defaults to using http over https, unless provided.
    expect(withScheme('foo.com')).toEqual('http://foo.com');
    expect(withScheme('http://foo.com')).toEqual('http://foo.com');
    expect(withScheme('https://foo.com')).toEqual('https://foo.com');
  });

  describe('mapStateToProps', () => {
    it('returns an empty object', () => {
      // The store provides the dispatch prop.
      expect(Browser.mapStateToProps({})).toEqual({});
    });
  });

  describe('onWillNavigate', () => {
    it('updates the navLocation', () => {
      const browser = new Browser();
      browser.setState = jest.fn();
      browser.onWillNavigate({ url: 'example.com' });
      expect(browser.setState).toHaveBeenCalledWith({
        navLocation: 'example.com',
      });
    });
  });

  describe('onDidGetRedirectRequest', () => {
    it('updates the navLocation', () => {
      const browser = new Browser();
      browser.setState = jest.fn();

      browser.onDidGetRedirectRequest({ newURL: '', isMainFrame: false });
      expect(browser.setState).not.toHaveBeenCalled();

      browser.onDidGetRedirectRequest({ newURL: '', isMainFrame: true });
      expect(browser.setState).not.toHaveBeenCalled();

      browser.onDidGetRedirectRequest({ newURL: 'example.com', isMainFrame: false });
      expect(browser.setState).not.toHaveBeenCalled();

      browser.onDidGetRedirectRequest({ newURL: 'example.com', isMainFrame: true });
      expect(browser.setState).toHaveBeenCalledWith({
        navLocation: 'example.com',
      });
    });
  });

  describe('onDidFailLoad', () => {
    it('Browser onDidFailLoad updates the state with an error message', () => {
      const browser = new Browser();
      browser.setState = jest.fn();
      browser.onDidFailLoad({ errorDescription: 'Not found!' });
      expect(browser.setState).toHaveBeenCalledWith({
        error: 'Not found!',
      });
    });
  });
});
