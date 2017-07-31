import { app } from 'electron';

import getConfig from 'main-process/config';
import createWindow from 'main-process/main-window';

getConfig()
  .then((config) => {
    let mainWindow;
    if (app.isReady()) {
      createWindow(mainWindow, config);
    } else {
      app.once('ready', createWindow.bind(null, mainWindow, config));
    }
    app.once('window-all-closed', app.quit);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.log('Uncaught error initializing application', error);
    process.exit(1);
  });
