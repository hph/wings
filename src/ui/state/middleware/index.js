import { applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import userInput from 'ui/state/middleware/user-input';
import cursorPosition from 'ui/state/middleware/cursor-position';
import commandBar from 'ui/state/middleware/command-bar';
import setCurrentPane from 'ui/state/middleware/set-current-pane';

export default applyMiddleware(
  thunk,
  userInput,
  cursorPosition,
  commandBar,
  setCurrentPane,
);
