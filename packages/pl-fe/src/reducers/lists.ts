import type { List } from 'pl-api';

type State = Record<string, List | false>;

const initialState: State = {};

const lists = (state: State = initialState, action: any) => {
  switch (action.type) {
    default:
      return state;
  }
};

export { lists as default };
