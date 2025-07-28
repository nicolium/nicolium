import { queryClient } from 'pl-fe/queries/client';
import toast from 'pl-fe/toast';
import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import { importEntities } from './importer';

import type { Account, List } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const LIST_EDITOR_TITLE_CHANGE = 'LIST_EDITOR_TITLE_CHANGE' as const;
const LIST_EDITOR_REPLIES_POLICY_CHANGE = 'LIST_EDITOR_REPLIES_POLICY_CHANGE' as const;
const LIST_EDITOR_EXCLUSIVE_CHANGE = 'LIST_EDITOR_EXCLUSIVE_CHANGE' as const;
const LIST_EDITOR_RESET = 'LIST_EDITOR_RESET' as const;
const LIST_EDITOR_SETUP = 'LIST_EDITOR_SETUP' as const;

const LIST_EDITOR_SUGGESTIONS_CHANGE = 'LIST_EDITOR_SUGGESTIONS_CHANGE' as const;
const LIST_EDITOR_SUGGESTIONS_READY = 'LIST_EDITOR_SUGGESTIONS_READY' as const;
const LIST_EDITOR_SUGGESTIONS_CLEAR = 'LIST_EDITOR_SUGGESTIONS_CLEAR' as const;

interface ListEditorSetupAction {
  type: typeof LIST_EDITOR_SETUP;
  list: List;
}

const setupListEditor = (listId: string) => (dispatch: AppDispatch) => {
  const list = queryClient.getQueryData<Array<List>>(['lists'])?.find((list) => list.id === listId);
  if (!list) return;

  dispatch<ListEditorSetupAction>({
    type: LIST_EDITOR_SETUP,
    list,
  });
};

const changeListEditorTitle = (value: string) => ({
  type: LIST_EDITOR_TITLE_CHANGE,
  value,
});

const changeListEditorRepliesPolicy = (repliesPolicy: List['replies_policy']) => ({
  type: LIST_EDITOR_REPLIES_POLICY_CHANGE,
  repliesPolicy,
});

const changeListEditorExclusive = (exclusive: boolean) => ({
  type: LIST_EDITOR_EXCLUSIVE_CHANGE,
  exclusive,
});

const resetListEditor = () => ({
  type: LIST_EDITOR_RESET,
});

const fetchListSuggestions = (q: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  return getClient(getState()).accounts.searchAccounts(q, { resolve: false, limit: 4, following: true }).then((data) => {
    dispatch(importEntities({ accounts: data }));
    dispatch(fetchListSuggestionsReady(q, data));
  }).catch(error => toast.showAlertForError(error));
};

const fetchListSuggestionsReady = (query: string, accounts: Array<Account>) => ({
  type: LIST_EDITOR_SUGGESTIONS_READY,
  query,
  accounts,
});

const clearListSuggestions = () => ({
  type: LIST_EDITOR_SUGGESTIONS_CLEAR,
});

const changeListSuggestions = (value: string) => ({
  type: LIST_EDITOR_SUGGESTIONS_CHANGE,
  value,
});

type ListsAction =
  | ListEditorSetupAction
  | ReturnType<typeof changeListEditorTitle>
  | ReturnType<typeof changeListEditorRepliesPolicy>
  | ReturnType<typeof changeListEditorExclusive>
  | ReturnType<typeof resetListEditor>
  | ReturnType<typeof fetchListSuggestionsReady>
  | ReturnType<typeof clearListSuggestions>
  | ReturnType<typeof changeListSuggestions>;

export {
  LIST_EDITOR_TITLE_CHANGE,
  LIST_EDITOR_REPLIES_POLICY_CHANGE,
  LIST_EDITOR_EXCLUSIVE_CHANGE,
  LIST_EDITOR_RESET,
  LIST_EDITOR_SETUP,
  LIST_EDITOR_SUGGESTIONS_CHANGE,
  LIST_EDITOR_SUGGESTIONS_READY,
  LIST_EDITOR_SUGGESTIONS_CLEAR,
  setupListEditor,
  changeListEditorTitle,
  changeListEditorRepliesPolicy,
  changeListEditorExclusive,
  resetListEditor,
  fetchListSuggestions,
  clearListSuggestions,
  changeListSuggestions,
  type ListsAction,
};
