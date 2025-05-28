import { defineMessages } from 'react-intl';

import { useModalsStore } from 'pl-fe/stores/modals';
import toast, { type IToastOptions } from 'pl-fe/toast';
import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import { importEntities } from './importer';

import type { Status } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const REBLOG_REQUEST = 'REBLOG_REQUEST' as const;
const REBLOG_FAIL = 'REBLOG_FAIL' as const;

const FAVOURITE_REQUEST = 'FAVOURITE_REQUEST' as const;
const FAVOURITE_FAIL = 'FAVOURITE_FAIL' as const;

const DISLIKE_REQUEST = 'DISLIKE_REQUEST' as const;
const DISLIKE_FAIL = 'DISLIKE_FAIL' as const;

const UNREBLOG_REQUEST = 'UNREBLOG_REQUEST' as const;
const UNREBLOG_FAIL = 'UNREBLOG_FAIL' as const;

const UNFAVOURITE_REQUEST = 'UNFAVOURITE_REQUEST' as const;

const UNDISLIKE_REQUEST = 'UNDISLIKE_REQUEST' as const;

const PIN_SUCCESS = 'PIN_SUCCESS' as const;

const UNPIN_SUCCESS = 'UNPIN_SUCCESS' as const;

const BOOKMARK_SUCCESS = 'BOOKMARKED_SUCCESS' as const;

const UNBOOKMARK_SUCCESS = 'UNBOOKMARKED_SUCCESS' as const;

const messages = defineMessages({
  bookmarkAdded: { id: 'status.bookmarked', defaultMessage: 'Bookmark added.' },
  bookmarkRemoved: { id: 'status.unbookmarked', defaultMessage: 'Bookmark removed.' },
  folderChanged: { id: 'status.bookmark_folder_changed', defaultMessage: 'Changed folder' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  selectFolder: { id: 'status.bookmark.select_folder', defaultMessage: 'Select folder' },
});

interface ReblogRequest {
  type: typeof REBLOG_REQUEST;
  statusId: string;
}

interface ReblogFail {
  type: typeof REBLOG_FAIL;
  statusId: string;
  error: unknown;
}

interface UnreblogRequest {
  type: typeof UNREBLOG_REQUEST;
  statusId: string;
}

interface UnreblogFail {
  type: typeof UNREBLOG_FAIL;
  statusId: string;
  error: unknown;
}

interface FavouriteRequest {
  type: typeof FAVOURITE_REQUEST;
  statusId: string;
}

interface FavouriteFail {
  type: typeof FAVOURITE_FAIL;
  statusId: string;
  error: unknown;
}

interface UnfavouriteRequest {
  type: typeof UNFAVOURITE_REQUEST;
  statusId: string;
}

interface DislikeRequest {
  type: typeof DISLIKE_REQUEST;
  statusId: string;
}

interface DislikeFail {
  type: typeof DISLIKE_FAIL;
  statusId: string;
  error: unknown;
}

interface UndislikeRequest {
  type: typeof UNDISLIKE_REQUEST;
  statusId: string;
}

const bookmark = (status: Pick<Status, 'id'>, folderId?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const features = state.auth.client.features;

    return getClient(getState()).statuses.bookmarkStatus(status.id, folderId).then((response) => {
      dispatch(importEntities({ statuses: [response] }));
      dispatch(bookmarkSuccess(response));

      let opts: IToastOptions = {
        actionLabel: messages.view,
        actionLink: folderId ? `/bookmarks/${folderId}` : '/bookmarks/all',
      };

      if (features.bookmarkFolders && typeof folderId !== 'string') {
        opts = {
          actionLabel: messages.selectFolder,
          action: () => useModalsStore.getState().openModal('SELECT_BOOKMARK_FOLDER', {
            statusId: status.id,
          }),
        };
      }

      toast.success(typeof folderId === 'string' ? messages.folderChanged : messages.bookmarkAdded, opts);
    });
  };

const unbookmark = (status: Pick<Status, 'id'>) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).statuses.unbookmarkStatus(status.id).then(response => {
      dispatch(importEntities({ statuses: [response] }));
      dispatch(unbookmarkSuccess(response));
      toast.success(messages.bookmarkRemoved);
    });

const toggleBookmark = (status: Pick<Status, 'id' | 'bookmarked'>) =>
  (dispatch: AppDispatch) => {
    if (status.bookmarked) {
      dispatch(unbookmark(status));
    } else {
      dispatch(bookmark(status));
    }
  };

const bookmarkSuccess = (status: Status) => ({
  type: BOOKMARK_SUCCESS,
  status,
  statusId: status.id,
});

const unbookmarkSuccess = (status: Status) => ({
  type: UNBOOKMARK_SUCCESS,
  status,
  statusId: status.id,
});

const pin = (status: Pick<Status, 'id'>, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    return getClient(getState()).statuses.pinStatus(status.id).then(response => {
      dispatch(importEntities({ statuses: [response] }));
      dispatch(pinSuccess(response, accountId));
    }).catch(error => {
    });
  };

const pinSuccess = (status: Status, accountId: string) => ({
  type: PIN_SUCCESS,
  status,
  statusId: status.id,
  accountId,
});

const unpin = (status: Pick<Status, 'id'>, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    return getClient(getState()).statuses.unpinStatus(status.id).then(response => {
      dispatch(importEntities({ statuses: [response] }));
      dispatch(unpinSuccess(response, accountId));
    });
  };

const togglePin = (status: Pick<Status, 'id' | 'pinned'>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const accountId = getState().me;

    if (!accountId) return;

    if (status.pinned) {
      dispatch(unpin(status, accountId));
    } else {
      dispatch(pin(status, accountId));
    }
  };

const unpinSuccess = (status: Status, accountId: string) => ({
  type: UNPIN_SUCCESS,
  status,
  statusId: status.id,
  accountId,
});

const remoteInteraction = (ap_id: string, profile: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).accounts.remoteInteraction(ap_id, profile).then((data) => data.url);

type InteractionsAction =
  | ReblogRequest
  | ReblogFail
  | UnreblogRequest
  | UnreblogFail
  | FavouriteRequest
  | FavouriteFail
  | UnfavouriteRequest
  | DislikeRequest
  | DislikeFail
  | UndislikeRequest
  | ReturnType<typeof bookmarkSuccess>
  | ReturnType<typeof unbookmarkSuccess>
  | ReturnType<typeof pinSuccess>
  | ReturnType<typeof unpinSuccess>

export {
  REBLOG_REQUEST,
  REBLOG_FAIL,
  FAVOURITE_REQUEST,
  FAVOURITE_FAIL,
  DISLIKE_REQUEST,
  DISLIKE_FAIL,
  UNREBLOG_REQUEST,
  UNREBLOG_FAIL,
  UNFAVOURITE_REQUEST,
  UNDISLIKE_REQUEST,
  PIN_SUCCESS,
  UNPIN_SUCCESS,
  BOOKMARK_SUCCESS,
  UNBOOKMARK_SUCCESS,
  bookmark,
  toggleBookmark,
  togglePin,
  remoteInteraction,
  type InteractionsAction,
};
