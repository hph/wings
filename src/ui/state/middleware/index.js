import { applyMiddleware } from 'redux';

import userInput from 'ui/state/middleware/user-input';
import cursorPosition from 'ui/state/middleware/cursor-position';

export default applyMiddleware(
  userInput,
  cursorPosition,
);
