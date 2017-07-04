import { applyMiddleware } from 'redux';

import userInput from 'ui/state/middleware/user-input';
import cursorPosition from 'ui/state/middleware/cursor-position';
import commandBar from 'ui/state/middleware/command-bar';

export default applyMiddleware(
  userInput,
  cursorPosition,
  commandBar,
);
