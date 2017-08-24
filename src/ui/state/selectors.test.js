import { currentView } from './selectors';

describe('currentView', () => {
  const views = [{ id: 1 }, { id: 2 }];

  it('should return the current view', () => {
    expect(currentView({
      views,
      config: {
        currentViewId: 1,
      },
    })).toEqual(views[0]);

    expect(currentView({
      views,
      config: {
        currentViewId: 2,
      },
    })).toEqual(views[1]);
  });

  it('should return the first view if there is no current view defined', () => {
    expect(currentView({
      views,
      config: {},
    })).toEqual(views[0]);
  });
});
