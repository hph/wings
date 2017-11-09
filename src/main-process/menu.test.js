import { Menu } from 'electron';

import setApplicationMenu, { template } from './menu';

jest.mock('electron', () => ({
  Menu: {
    buildFromTemplate: jest.fn(() => 'built template'),
    setApplicationMenu: jest.fn(),
  },
}));

describe('menu', () => {
  test('template should have a static value', () => {
    expect(template).toMatchSnapshot();
  });

  test('default export should build create and set the menu', () => {
    setApplicationMenu();
    expect(Menu.buildFromTemplate).toHaveBeenCalledWith(template);
    expect(Menu.setApplicationMenu).toHaveBeenCalledWith('built template');
  });
});
