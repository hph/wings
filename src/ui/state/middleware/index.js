import { applyMiddleware } from 'redux';

import userInput from 'ui/state/middleware/user-input';
import cursorPosition from 'ui/state/middleware/cursor-position';
import commandBar from 'ui/state/middleware/command-bar';
import setCurrentPane from 'ui/state/middleware/set-current-pane';

export default applyMiddleware(
  userInput,
  cursorPosition,
  commandBar,
  setCurrentPane,
);
