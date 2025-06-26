import { create } from 'mutative';

import {
  FAVOURITED_STATUSES_FETCH_REQUEST,
  FAVOURITED_STATUSES_FETCH_SUCCESS,
  FAVOURITED_STATUSES_FETCH_FAIL,
  FAVOURITED_STATUSES_EXPAND_REQUEST,
  FAVOURITED_STATUSES_EXPAND_SUCCESS,
  FAVOURITED_STATUSES_EXPAND_FAIL,
  ACCOUNT_FAVOURITED_STATUSES_FETCH_REQUEST,
  ACCOUNT_FAVOURITED_STATUSES_FETCH_SUCCESS,
  ACCOUNT_FAVOURITED_STATUSES_FETCH_FAIL,
  ACCOUNT_FAVOURITED_STATUSES_EXPAND_REQUEST,
  ACCOUNT_FAVOURITED_STATUSES_EXPAND_SUCCESS,
  ACCOUNT_FAVOURITED_STATUSES_EXPAND_FAIL,
  type FavouritesAction,
} from 'pl-fe/actions/favourites';
import {
  PIN_SUCCESS,
  UNPIN_SUCCESS,
  type InteractionsAction,
} from 'pl-fe/actions/interactions';
import { PINNED_STATUSES_FETCH_SUCCESS, type PinStatusesAction } from 'pl-fe/actions/pin-statuses';

import type { PaginatedResponse, Status } from 'pl-api';
import type { StatusesAction } from 'pl-fe/actions/statuses';

interface StatusList {
  next: (() => Promise<PaginatedResponse<Status>>) | null;
  loaded: boolean;
  isLoading: boolean | null;
  items: Array<string>;
}

const newStatusList = (): StatusList => ({
  next: null,
  loaded: false,
  isLoading: null,
  items: [],
});

type State = Record<string, StatusList>;

const initialState: State = {
  favourites: newStatusList(),
  pins: newStatusList(),
};

const getStatusId = (status: string | Pick<Status, 'id'>) => typeof status === 'string' ? status : status.id;

const getStatusIds = (statuses: Array<string | Pick<Status, 'id'>> = []) => statuses.map(getStatusId);

const setLoading = (state: State, listType: string, loading: boolean) => {
  const list = state[listType] = state[listType] || newStatusList();
  list.isLoading = loading;
};

const normalizeList = (state: State, listType: string, statuses: Array<string | Pick<Status, 'id'>>, next: (() => Promise<PaginatedResponse<Status>>) | null) => {
  const list = state[listType] = state[listType] || newStatusList();

  list.next = next;
  list.loaded = true;
  list.isLoading = false;
  list.items = getStatusIds(statuses);
};

const appendToList = (state: State, listType: string, statuses: Array<string | Pick<Status, 'id'>>, next: (() => Promise<PaginatedResponse<Status>>) | null) => {
  const newIds = getStatusIds(statuses);

  const list = state[listType] = state[listType] || newStatusList();

  list.next = next;
  list.isLoading = false;
  list.items = [...new Set([...list.items, ...newIds])];
};

const prependOneToList = (state: State, listType: string, status: string | Pick<Status, 'id'>) => {
  const statusId = getStatusId(status);
  const list = state[listType] = state[listType] || newStatusList();

  list.items = [...new Set([statusId, ...list.items])];
};

const removeOneFromList = (state: State, listType: string, status: string | Pick<Status, 'id'>) => {
  const statusId = getStatusId(status);
  const list = state[listType] = state[listType] || newStatusList();

  list.items = list.items.filter(id => id !== statusId);
};

const statusLists = (state = initialState, action: FavouritesAction | InteractionsAction | PinStatusesAction | StatusesAction): State => {
  switch (action.type) {
    case FAVOURITED_STATUSES_FETCH_REQUEST:
    case FAVOURITED_STATUSES_EXPAND_REQUEST:
      return create(state, draft => setLoading(draft, 'favourites', true));
    case FAVOURITED_STATUSES_FETCH_FAIL:
    case FAVOURITED_STATUSES_EXPAND_FAIL:
      return create(state, draft => setLoading(draft, 'favourites', false));
    case FAVOURITED_STATUSES_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, 'favourites', action.statuses, action.next));
    case FAVOURITED_STATUSES_EXPAND_SUCCESS:
      return create(state, draft => appendToList(draft, 'favourites', action.statuses, action.next));
    case ACCOUNT_FAVOURITED_STATUSES_FETCH_REQUEST:
    case ACCOUNT_FAVOURITED_STATUSES_EXPAND_REQUEST:
      return create(state, draft => setLoading(draft, `favourites:${action.accountId}`, true));
    case ACCOUNT_FAVOURITED_STATUSES_FETCH_FAIL:
    case ACCOUNT_FAVOURITED_STATUSES_EXPAND_FAIL:
      return create(state, draft => setLoading(draft, `favourites:${action.accountId}`, false));
    case ACCOUNT_FAVOURITED_STATUSES_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, `favourites:${action.accountId}`, action.statuses, action.next));
    case ACCOUNT_FAVOURITED_STATUSES_EXPAND_SUCCESS:
      return create(state, draft => appendToList(draft, `favourites:${action.accountId}`, action.statuses, action.next));
    case PINNED_STATUSES_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, 'pins', action.statuses, action.next));
    case PIN_SUCCESS:
      return create(state, draft => prependOneToList(draft, 'pins', action.status));
    case UNPIN_SUCCESS:
      return create(state, draft => removeOneFromList(draft, 'pins', action.status));
    default:
      return state;
  }
};

export {
  statusLists as default,
};
