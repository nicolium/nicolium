import { queryClient } from 'pl-fe/queries/client';
import { selectAccount } from 'pl-fe/selectors';
import toast from 'pl-fe/toast';
import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import { importEntities } from './importer';

import type { Account, List, PaginatedResponse } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const LIST_EDITOR_TITLE_CHANGE = 'LIST_EDITOR_TITLE_CHANGE' as const;
const LIST_EDITOR_RESET = 'LIST_EDITOR_RESET' as const;
const LIST_EDITOR_SETUP = 'LIST_EDITOR_SETUP' as const;

const LIST_ACCOUNTS_FETCH_REQUEST = 'LIST_ACCOUNTS_FETCH_REQUEST' as const;
const LIST_ACCOUNTS_FETCH_SUCCESS = 'LIST_ACCOUNTS_FETCH_SUCCESS' as const;
const LIST_ACCOUNTS_FETCH_FAIL = 'LIST_ACCOUNTS_FETCH_FAIL' as const;

const LIST_EDITOR_SUGGESTIONS_CHANGE = 'LIST_EDITOR_SUGGESTIONS_CHANGE' as const;
const LIST_EDITOR_SUGGESTIONS_READY = 'LIST_EDITOR_SUGGESTIONS_READY' as const;
const LIST_EDITOR_SUGGESTIONS_CLEAR = 'LIST_EDITOR_SUGGESTIONS_CLEAR' as const;

const LIST_EDITOR_ADD_SUCCESS = 'LIST_EDITOR_ADD_SUCCESS' as const;

const LIST_EDITOR_REMOVE_SUCCESS = 'LIST_EDITOR_REMOVE_SUCCESS' as const;

const LIST_ADDER_RESET = 'LIST_ADDER_RESET' as const;
const LIST_ADDER_SETUP = 'LIST_ADDER_SETUP' as const;

const LIST_ADDER_LISTS_FETCH_REQUEST = 'LIST_ADDER_LISTS_FETCH_REQUEST' as const;
const LIST_ADDER_LISTS_FETCH_SUCCESS = 'LIST_ADDER_LISTS_FETCH_SUCCESS' as const;
const LIST_ADDER_LISTS_FETCH_FAIL = 'LIST_ADDER_LISTS_FETCH_FAIL' as const;

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

  dispatch(fetchListAccounts(listId));
};

const changeListEditorTitle = (value: string) => ({
  type: LIST_EDITOR_TITLE_CHANGE,
  value,
});

const resetListEditor = () => ({
  type: LIST_EDITOR_RESET,
});

const fetchListAccounts = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(fetchListAccountsRequest(listId));

  return getClient(getState()).lists.getListAccounts(listId).then(({ items, next }) => {
    dispatch(importEntities({ accounts: items }));
    dispatch(fetchListAccountsSuccess(listId, items, next));
  }).catch(err => dispatch(fetchListAccountsFail(listId, err)));
};

const fetchListAccountsRequest = (listId: string) => ({
  type: LIST_ACCOUNTS_FETCH_REQUEST,
  listId,
});

const fetchListAccountsSuccess = (listId: string, accounts: Account[], next: (() => Promise<PaginatedResponse<Account>>) | null) => ({
  type: LIST_ACCOUNTS_FETCH_SUCCESS,
  listId,
  accounts,
  next,
});

const fetchListAccountsFail = (listId: string, error: unknown) => ({
  type: LIST_ACCOUNTS_FETCH_FAIL,
  listId,
  error,
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

const addToListEditor = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(addToList(getState().listEditor.listId!, accountId));
};

const addToList = (listId: string, accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  return getClient(getState()).lists.addListAccounts(listId, [accountId])
    .then(() => dispatch(addToListSuccess(listId, accountId)));
};

const addToListSuccess = (listId: string, accountId: string) => ({
  type: LIST_EDITOR_ADD_SUCCESS,
  listId,
  accountId,
});

const removeFromListEditor = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(removeFromList(getState().listEditor.listId!, accountId));
};

const removeFromList = (listId: string, accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  return getClient(getState()).lists.deleteListAccounts(listId, [accountId])
    .then(() => dispatch(removeFromListSuccess(listId, accountId)));
};

const removeFromListSuccess = (listId: string, accountId: string) => ({
  type: LIST_EDITOR_REMOVE_SUCCESS,
  listId,
  accountId,
});

const resetListAdder = () => ({
  type: LIST_ADDER_RESET,
});

interface ListAdderSetupAction {
  type: typeof LIST_ADDER_SETUP;
  account: Account;
}

const setupListAdder = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const account = selectAccount(getState(), accountId);
  if (!account) return;

  dispatch<ListAdderSetupAction>({
    type: LIST_ADDER_SETUP,
    account,
  });
  dispatch(fetchAccountLists(accountId));
};

const fetchAccountLists = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(fetchAccountListsRequest(accountId));

  return getClient(getState()).accounts.getAccountLists(accountId)
    .then((data) => dispatch(fetchAccountListsSuccess(accountId, data)))
    .catch(err => dispatch(fetchAccountListsFail(accountId, err)));
};

const fetchAccountListsRequest = (listId: string) => ({
  type: LIST_ADDER_LISTS_FETCH_REQUEST,
  listId,
});

const fetchAccountListsSuccess = (listId: string, lists: Array<List>) => ({
  type: LIST_ADDER_LISTS_FETCH_SUCCESS,
  listId,
  lists,
});

const fetchAccountListsFail = (listId: string, err: unknown) => ({
  type: LIST_ADDER_LISTS_FETCH_FAIL,
  listId,
  err,
});

const addToListAdder = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(addToList(listId, getState().listAdder.accountId!));
};

const removeFromListAdder = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(removeFromList(listId, getState().listAdder.accountId!));
};

type ListsAction =
  | ListEditorSetupAction
  | ReturnType<typeof changeListEditorTitle>
  | ReturnType<typeof resetListEditor>
  | ReturnType<typeof fetchListAccountsRequest>
  | ReturnType<typeof fetchListAccountsSuccess>
  | ReturnType<typeof fetchListAccountsFail>
  | ReturnType<typeof fetchListSuggestionsReady>
  | ReturnType<typeof clearListSuggestions>
  | ReturnType<typeof changeListSuggestions>
  | ReturnType<typeof addToListSuccess>
  | ReturnType<typeof removeFromListSuccess>
  | ReturnType<typeof resetListAdder>
  | ListAdderSetupAction
  | ReturnType<typeof fetchAccountListsRequest>
  | ReturnType<typeof fetchAccountListsSuccess>
  | ReturnType<typeof fetchAccountListsFail>;

export {
  LIST_EDITOR_TITLE_CHANGE,
  LIST_EDITOR_RESET,
  LIST_EDITOR_SETUP,
  LIST_ACCOUNTS_FETCH_REQUEST,
  LIST_ACCOUNTS_FETCH_SUCCESS,
  LIST_ACCOUNTS_FETCH_FAIL,
  LIST_EDITOR_SUGGESTIONS_CHANGE,
  LIST_EDITOR_SUGGESTIONS_READY,
  LIST_EDITOR_SUGGESTIONS_CLEAR,
  LIST_EDITOR_ADD_SUCCESS,
  LIST_EDITOR_REMOVE_SUCCESS,
  LIST_ADDER_RESET,
  LIST_ADDER_SETUP,
  LIST_ADDER_LISTS_FETCH_REQUEST,
  LIST_ADDER_LISTS_FETCH_SUCCESS,
  LIST_ADDER_LISTS_FETCH_FAIL,
  setupListEditor,
  changeListEditorTitle,
  resetListEditor,
  fetchListSuggestions,
  clearListSuggestions,
  changeListSuggestions,
  addToListEditor,
  removeFromListEditor,
  resetListAdder,
  setupListAdder,
  addToListAdder,
  removeFromListAdder,
  type ListsAction,
};
