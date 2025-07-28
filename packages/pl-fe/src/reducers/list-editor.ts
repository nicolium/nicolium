import { create } from 'mutative';

import {
  LIST_EDITOR_RESET,
  LIST_EDITOR_SETUP,
  LIST_EDITOR_TITLE_CHANGE,
  LIST_EDITOR_EXCLUSIVE_CHANGE,
  LIST_EDITOR_REPLIES_POLICY_CHANGE,
  type ListsAction,
} from '../actions/lists';

import type { List } from 'pl-api';


interface State {
  listId: string | null;
  isSubmitting: boolean;
  title: string;
  repliesPolicy: List['replies_policy'];
  exclusive?: boolean;
}

const initialState: State = {
  listId: null,
  isSubmitting: false,
  title: '',
  repliesPolicy: undefined,
  exclusive: false,
};

const listEditorReducer = (state: State = initialState, action: ListsAction): State => {
  switch (action.type) {
    case LIST_EDITOR_RESET:
      return initialState;
    case LIST_EDITOR_SETUP:
      return create(state, (draft) => {
        draft.listId = action.list.id;
        draft.title = action.list.title;
        draft.repliesPolicy = action.list.replies_policy;
        draft.exclusive = action.list.exclusive;
        draft.isSubmitting = false;
      });
    case LIST_EDITOR_TITLE_CHANGE:
      return create(state, (draft) => {
        draft.title = action.value;
      });
    case LIST_EDITOR_EXCLUSIVE_CHANGE:
      return create(state, (draft) => {
        draft.exclusive = action.exclusive;
      });
    case LIST_EDITOR_REPLIES_POLICY_CHANGE:
      return create(state, (draft) => {
        draft.repliesPolicy = action.repliesPolicy;
      });
    default:
      return state;
  }
};

export { listEditorReducer as default };
