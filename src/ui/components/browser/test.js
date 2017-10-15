import React from 'react';
import renderer from 'react-test-renderer';

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

describe('Browser', () => {
  const createTree = (passedProps = {}, mockMethods = {}) => {
    const props = {
      userInputFocus: jest.fn(),
      ...passedProps,
    };
    const createNodeMock = createNodeMockCreator(mockMethods);
    const component = renderer.create(<Browser {...props} />, { createNodeMock });
    return {
      component,
      tree: component.toJSON(),
    };
  };

  it('should render a default browser view', () => {
    const { tree } = createTree();

    expect(tree).toMatchSnapshot();
  });

  it('should select the navigation bar on mount', done => {
    const select = jest.fn();
    createTree({}, { select });

    setTimeout(() => {
      expect(select.mock.calls.length).toBe(1);
      done();
    });
  });

  it('should set up event listeners on mount', () => {
    const addEventListener = jest.fn();
    createTree({}, { addEventListener });

    expect(addEventListener.mock.calls.length).toBe(3);
    expect(addEventListener.mock.calls[0][0]).toEqual('will-navigate');
    expect(addEventListener.mock.calls[1][0]).toEqual('did-get-redirect-request');
    expect(addEventListener.mock.calls[2][0]).toEqual('did-fail-load');
  });

  it('should call a function to stop user input focus on click', () => {
    const userInputFocus = jest.fn();
    const { tree } = createTree({ userInputFocus });
    tree.children[0].props.onMouseDown();

    expect(userInputFocus).toHaveBeenCalledWith(false);
  });

  it('should update the value in the navbar as the user types', () => {
    const { component, tree } = createTree();
    expect(tree).toMatchSnapshot();
    tree.children[0].props.onChange({ target: { value: 'example.com' } });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('should navigate to the URL in the navbar on an Enter keypress', () => {
    const reload = jest.fn();
    const { component, tree } = createTree({}, { reload });
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

  it('should show an error on a webview load error', () => {
    let onDidFailLoad;
    const addEventListener = jest.fn((event, callback) => {
      if (event === 'did-fail-load') {
        onDidFailLoad = callback;
      }
    });
    const { component } = createTree({}, { addEventListener });
    onDidFailLoad({ errorDescription: 'oh no!' });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('withScheme function should prepend an HTTP scheme to a string', () => {
    // Defaults to using http over https, unless provided.
    expect(withScheme('foo.com')).toEqual('http://foo.com');
    expect(withScheme('http://foo.com')).toEqual('http://foo.com');
    expect(withScheme('https://foo.com')).toEqual('https://foo.com');
  });

  it('onWillNavigate should update the navLocation', () => {
    const browser = new Browser();
    browser.setState = jest.fn();
    browser.onWillNavigate({ url: 'example.com' });

    expect(browser.setState).toHaveBeenCalledWith({
      navLocation: 'example.com',
    });
  });

  it('onDidGetRedirectRequest should update the navLocation', () => {
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

  it('onDidFailLoad should update the state with an error message', () => {
    const browser = new Browser();
    browser.setState = jest.fn();
    browser.onDidFailLoad({ errorDescription: 'Not found!' });

    expect(browser.setState).toHaveBeenCalledWith({
      error: 'Not found!',
    });
  });
});
