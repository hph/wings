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
  .catch(({ reason }) => {
    // eslint-disable-next-line no-console
    console.log(`Invalid config file (reason: ${ reason })`);
    process.exit(1);
  });
