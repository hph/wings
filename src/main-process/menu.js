import { Menu } from 'electron';

export const template = [
  {
    label: 'Edit',
    submenu: [{ role: 'copy' }, { role: 'paste' }],
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'toggledevtools' },
      { role: 'togglefullscreen' },
    ],
  },
];

export default () => Menu.setApplicationMenu(Menu.buildFromTemplate(template));
