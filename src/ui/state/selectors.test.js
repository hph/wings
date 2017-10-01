import { currentPane } from './selectors';

describe('currentPane', () => {
  const panes = [{ id: 1 }, { id: 2 }];

  it('should return the current pane', () => {
    expect(currentPane({
      panes,
      config: {
        currentPaneId: 1,
      },
    })).toEqual(panes[0]);

    expect(currentPane({
      panes,
      config: {
        currentPaneId: 2,
      },
    })).toEqual(panes[1]);
  });

  it('should return the first pane if there is no current pane defined', () => {
    expect(currentPane({
      panes,
      config: {},
    })).toEqual(panes[0]);
  });
});
