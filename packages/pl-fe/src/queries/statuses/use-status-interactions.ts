import { InfiniteData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defineMessages } from 'react-intl';

import { importEntities } from 'pl-fe/actions/importer';
import { PIN_SUCCESS, UNPIN_SUCCESS, type InteractionsAction } from 'pl-fe/actions/interactions';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { makePaginatedResponseQuery } from 'pl-fe/queries/utils/make-paginated-response-query';
import { minifyAccountList } from 'pl-fe/queries/utils/minify-list';
import { useModalsStore } from 'pl-fe/stores/modals';
import toast, { IToastOptions } from 'pl-fe/toast';

import type { PaginatedResponse } from 'pl-api';

const messages = defineMessages({
  bookmarkAdded: { id: 'status.bookmarked', defaultMessage: 'Bookmark added.' },
  bookmarkRemoved: { id: 'status.unbookmarked', defaultMessage: 'Bookmark removed.' },
  folderChanged: { id: 'status.bookmark_folder_changed', defaultMessage: 'Changed folder' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  selectFolder: { id: 'status.bookmark.select_folder', defaultMessage: 'Select folder' },
});

const queryKey = {
  getDislikedBy: 'statusDislikes',
  getFavouritedBy: 'statusFavourites',
  getRebloggedBy: 'statusReblogs',
};

const makeUseStatusInteractions = (method: 'getDislikedBy' | 'getFavouritedBy' | 'getRebloggedBy') => makePaginatedResponseQuery(
  (statusId: string) => ['accountsLists', queryKey[method], statusId],
  (client, params) => client.statuses[method](...params).then(minifyAccountList),
);

const useStatusDislikes = makeUseStatusInteractions('getDislikedBy');
const useStatusFavourites = makeUseStatusInteractions('getFavouritedBy');
const useStatusReblogs = makeUseStatusInteractions('getRebloggedBy');

const useStatusReactions = (statusId: string, emoji?: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['accountsLists', 'statusReactions', statusId, emoji],
    queryFn: () => client.statuses.getStatusReactions(statusId, emoji).then((reactions) => {
      dispatch(importEntities({ accounts: reactions.map(({ accounts }) => accounts).flat() }));

      return reactions.map(({ accounts, ...reactions }) => reactions);
    }),
    placeholderData: (previousData) => previousData?.filter(({ name }) => name === emoji),
  });
};

const useFavouriteStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'favourite', statusId],
    mutationFn: () => client.statuses.favouriteStatus(statusId),
    onMutate: () => dispatch<InteractionsAction>({ type: 'FAVOURITE_REQUEST', statusId }),
    onError: () => dispatch<InteractionsAction>({ type: 'UNFAVOURITE_REQUEST', statusId }),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusFavourites', statusId] });
    },
  });
};

const useUnfavouriteStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'favourite', statusId],
    mutationFn: () => client.statuses.unfavouriteStatus(statusId),
    onMutate: () => dispatch<InteractionsAction>({ type: 'UNFAVOURITE_REQUEST', statusId }),
    onError: () => dispatch<InteractionsAction>({ type: 'FAVOURITE_REQUEST', statusId }),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusFavourites', statusId] });
    },
  });
};

const useDislikeStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'dislike', statusId],
    mutationFn: () => client.statuses.dislikeStatus(statusId),
    onMutate: () => dispatch<InteractionsAction>({ type: 'DISLIKE_REQUEST', statusId }),
    onError: () => dispatch<InteractionsAction>({ type: 'UNDISLIKE_REQUEST', statusId }),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusDislikes', statusId] });
    },
  });
};

const useUndislikeStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'dislike', statusId],
    mutationFn: () => client.statuses.undislikeStatus(statusId),
    onMutate: () => dispatch<InteractionsAction>({ type: 'UNDISLIKE_REQUEST', statusId }),
    onError: () => dispatch<InteractionsAction>({ type: 'DISLIKE_REQUEST', statusId }),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusDislikes', statusId] });
    },
  });
};

const useReblogStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'reblog', statusId],
    mutationFn: (visibility?: string) => client.statuses.reblogStatus(statusId, visibility),
    onMutate: () => dispatch<InteractionsAction>({ type: 'REBLOG_REQUEST', statusId }),
    onError: (error) => dispatch<InteractionsAction>({ type: 'REBLOG_FAIL', statusId, error }),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusReblogs', statusId] });
    },
  });
};

const useUnreblogStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'reblog', statusId],
    mutationFn: () => client.statuses.unreblogStatus(statusId),
    onMutate: () => dispatch<InteractionsAction>({ type: 'UNREBLOG_REQUEST', statusId }),
    onError: (error) => dispatch<InteractionsAction>({ type: 'UNREBLOG_FAIL', statusId, error }),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusReblogs', statusId] });
    },
  });
};

const useBookmarkStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const features = useFeatures();
  const { openModal } = useModalsStore();

  let previouslyBookmarked = false;
  let previousFolder: string | null;

  return useMutation({
    mutationKey: ['statuses', 'bookmark', statusId],
    mutationFn: (folderId?: string) => {
      dispatch((_, getState) => {
        const status = getState().statuses[statusId];
        previouslyBookmarked = status?.bookmarked;
        previousFolder = status?.bookmark_folder;
      });
      return client.statuses.bookmarkStatus(statusId, folderId);
    },
    onSettled: (status, _, folderId) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'statusReblogs', statusId] });

      if (previousFolder) {
        queryClient.setQueryData<InfiniteData<PaginatedResponse<string>>>(
          ['statusLists', 'bookmarks', previousFolder],
          (data) => data ? {
            ...data,
            pages: data.pages.map(({ items, ...page }) => ({ ...page, items: items.filter((id) => id !== statusId) })),
          } : undefined);
      }

      if (!previouslyBookmarked) {
        queryClient.invalidateQueries({ queryKey: ['statusLists', 'bookmarks', undefined] });
      }

      if (folderId) {
        queryClient.invalidateQueries({ queryKey: ['statusLists', 'bookmarks', folderId] });
      }

      let opts: IToastOptions = {
        actionLabel: messages.view,
        actionLink: folderId ? `/bookmarks/${folderId}` : '/bookmarks/all',
      };

      if (features.bookmarkFolders && typeof folderId !== 'string') {
        opts = {
          actionLabel: messages.selectFolder,
          action: () => openModal('SELECT_BOOKMARK_FOLDER', {
            statusId,
          }),
        };
      }

      toast.success(typeof folderId === 'string' ? messages.folderChanged : messages.bookmarkAdded, opts);
    },
  });
};

const useUnbookmarkStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'bookmark', statusId],
    mutationFn: () => client.statuses.unbookmarkStatus(statusId),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));

      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>({
        queryKey: ['statusLists', 'bookmarks'],
        exact: false,
      }, (data) => data ? {
        ...data,
        pages: data.pages.map(({ items, ...page }) => ({ ...page, items: items.filter((id) => id !== statusId) })),
      } : undefined);

      toast.success(messages.bookmarkRemoved);
    },
  });
};

const usePinStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationKey: ['statuses', 'pin', statusId],
    mutationFn: () => client.statuses.pinStatus(statusId),
    onSuccess: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      dispatch<InteractionsAction>({ type: PIN_SUCCESS, statusId: status.id, accountId: status.account.id });
    },
  });
};

const useUnpinStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationKey: ['statuses', 'unpin', statusId],
    mutationFn: () => client.statuses.unpinStatus(statusId),
    onSuccess: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      dispatch<InteractionsAction>({ type: UNPIN_SUCCESS, statusId: status.id, accountId: status.account.id });
    },
  });
};

export {
  useStatusDislikes,
  useStatusFavourites,
  useStatusReactions,
  useStatusReblogs,
  useFavouriteStatus,
  useUnfavouriteStatus,
  useDislikeStatus,
  useUndislikeStatus,
  useReblogStatus,
  useUnreblogStatus,
  useBookmarkStatus,
  useUnbookmarkStatus,
  usePinStatus,
  useUnpinStatus,
};
