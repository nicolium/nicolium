import reducer from './status-lists';

describe('status_lists reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any).toJS()).toEqual({
      pins: {
        next: null,
        loaded: false,
        isLoading: null,
        items: [],
      },
    });
  });
});
