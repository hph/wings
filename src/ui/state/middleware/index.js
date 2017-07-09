import { applyMiddleware } from 'redux';

import userInput from 'ui/state/middleware/user-input';
import cursorPosition from 'ui/state/middleware/cursor-position';
import commandBar from 'ui/state/middleware/command-bar';
import setCurrentView from 'ui/state/middleware/set-current-view';

export default applyMiddleware(
  userInput,
  cursorPosition,
  commandBar,
  setCurrentView,
);
