import createStore from 'ui/state/store';

export default function configureStore({
  configDefaults,
  getPreloadedState,
  getText,
}) {
  const { filename, ...preloadedState } = getPreloadedState();
  return getText(filename)
    .catch(error => {
      if (error.code === 'ENOENT') {
        // It's fine if the file doesn't exist, just return an empty file.
        return '';
      }

      // If the error was due to another reason, we must handle it separately.
      throw error;
    })
    .then(text => {
      const panes = [];
      if (typeof text === 'string') {
        const lines = text === '' ? [''] : text.split('\n').slice(0, -1);
        panes[0] = {
          filename,
          lines,
          id: 0,
          column: 0,
          row: 0,
          prevMaxColumn: 0,
          firstVisibleRow: 0,
          firstVisibleColumn: 0,
          width: window.screen.width,
          height: window.screen.height,
        };
      }
      return createStore({
        panes,
        config: {
          ...configDefaults,
          ...preloadedState,
          currentPaneId: 0,
        },
      });
    });
}
