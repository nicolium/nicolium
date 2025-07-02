import { create } from 'mutative';

import {
  PIN_SUCCESS,
  UNPIN_SUCCESS,
  type InteractionsAction,
} from 'pl-fe/actions/interactions';
import { PINNED_STATUSES_FETCH_SUCCESS, type PinStatusesAction } from 'pl-fe/actions/pin-statuses';

import type { PaginatedResponse, Status } from 'pl-api';

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

const normalizeList = (state: State, listType: string, statuses: Array<string | Pick<Status, 'id'>>, next: (() => Promise<PaginatedResponse<Status>>) | null) => {
  const list = state[listType] = state[listType] || newStatusList();

  list.next = next;
  list.loaded = true;
  list.isLoading = false;
  list.items = getStatusIds(statuses);
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

const statusLists = (state = initialState, action: InteractionsAction | PinStatusesAction): State => {
  switch (action.type) {
    case PINNED_STATUSES_FETCH_SUCCESS:
      return create(state, draft => normalizeList(draft, 'pins', action.statuses, action.next));
    case PIN_SUCCESS:
      return create(state, draft => prependOneToList(draft, 'pins', action.statusId));
    case UNPIN_SUCCESS:
      return create(state, draft => removeOneFromList(draft, 'pins', action.statusId));
    default:
      return state;
  }
};

export {
  statusLists as default,
};
