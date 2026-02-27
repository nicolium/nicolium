import { type InfiniteData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defineMessages } from 'react-intl';

import { importEntities } from '@/actions/importer';
import { PIN_SUCCESS, UNPIN_SUCCESS, type InteractionsAction } from '@/actions/interactions';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyAccountList } from '@/queries/utils/minify-list';
import { useModalsActions } from '@/stores/modals';
import toast, { type IToastOptions } from '@/toast';

import { queryKeys } from '../keys';
import { filterById } from '../utils/filter-id';

import type { NormalizedStatus } from '@/reducers/statuses';
import type { EmojiReaction, PaginatedResponse } from 'pl-api';

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
} as const;

const makeUseStatusInteractions = (
  method: 'getDislikedBy' | 'getFavouritedBy' | 'getRebloggedBy',
) =>
  makePaginatedResponseQuery(
    (statusId: string) => queryKeys.accountsLists[queryKey[method]](statusId),
    (client, params) => client.statuses[method](...params).then(minifyAccountList),
  );

const useStatusDislikes = makeUseStatusInteractions('getDislikedBy');
const useStatusFavourites = makeUseStatusInteractions('getFavouritedBy');
const useStatusReblogs = makeUseStatusInteractions('getRebloggedBy');

const minifyEmojiReaction = ({ accounts, ...reaction }: EmojiReaction) => reaction;

type MinifiedEmojiReaction = ReturnType<typeof minifyEmojiReaction>;

const updateStatus = (
  statusId: string,
  changes: Partial<NormalizedStatus> | ((status: NormalizedStatus) => NormalizedStatus),
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  const previousStatus = queryClient.getQueryData<NormalizedStatus>(
    queryKeys.statuses.show(statusId),
  );
  if (!previousStatus) return;

  const newStatus =
    typeof changes === 'function' ? changes(previousStatus) : { ...previousStatus, ...changes };
  queryClient.setQueryData(queryKeys.statuses.show(statusId), newStatus);

  return { previousStatus };
};

const restorePreviousStatus = (
  statusId: string,
  context: { previousStatus?: NormalizedStatus } | undefined,
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  if (context?.previousStatus) {
    queryClient.setQueryData(queryKeys.statuses.show(statusId), context.previousStatus);
  }
};

const useStatusReactions = (statusId: string, emoji?: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.accountsLists.statusReactions(statusId, emoji),
    queryFn: () =>
      client.statuses.getStatusReactions(statusId, emoji).then((reactions) => {
        for (const { accounts } of reactions) {
          for (const account of accounts) {
            queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
          }
        }

        return reactions.map(minifyEmojiReaction);
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
    onMutate: () =>
      updateStatus(
        statusId,
        (status) => ({
          ...status,
          favourited: true,
          favourites_count: status.favourites_count + 1,
        }),
        queryClient,
      ),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({
        queryKey: queryKeys.accountsLists.statusFavourites(statusId),
      });
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
    onMutate: () =>
      updateStatus(
        statusId,
        (status) => ({
          ...status,
          favourited: false,
          favourites_count: Math.max(0, status.favourites_count - 1),
        }),
        queryClient,
      ),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({
        queryKey: queryKeys.accountsLists.statusFavourites(statusId),
      });
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
    onMutate: () =>
      updateStatus(
        statusId,
        (status) => ({
          ...status,
          disliked: true,
          dislikes_count: status.dislikes_count + 1,
        }),
        queryClient,
      ),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: queryKeys.accountsLists.statusDislikes(statusId) });
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
    onMutate: () =>
      updateStatus(
        statusId,
        (status) => ({
          ...status,
          disliked: false,
          dislikes_count: Math.max(0, status.dislikes_count - 1),
        }),
        queryClient,
      ),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: queryKeys.accountsLists.statusDislikes(statusId) });
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
    onMutate: () =>
      updateStatus(
        statusId,
        (status) => ({
          ...status,
          reblogged: true,
          reblogs_count: status.reblogs_count + 1,
        }),
        queryClient,
      ),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: queryKeys.accountsLists.statusReblogs(statusId) });
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
    onMutate: () =>
      updateStatus(
        statusId,
        (status) => ({
          ...status,
          reblogged: false,
          reblogs_count: Math.max(0, status.reblogs_count - 1),
        }),
        queryClient,
      ),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: queryKeys.accountsLists.statusReblogs(statusId) });
    },
  });
};

const useBookmarkStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const features = useFeatures();
  const { openModal } = useModalsActions();

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
    onMutate: () => updateStatus(statusId, { bookmarked: true }, queryClient),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient),
    onSettled: (status, _, folderId) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: queryKeys.accountsLists.statusReblogs(statusId) });

      if (previousFolder) {
        queryClient.setQueryData(
          queryKeys.statusLists.bookmarks(previousFolder),
          filterById(statusId),
        );
      }

      if (!previouslyBookmarked) {
        queryClient.invalidateQueries({ queryKey: queryKeys.statusLists.bookmarks(undefined) });
      }

      if (folderId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.statusLists.bookmarks(folderId) });
      }

      let opts: IToastOptions = {
        actionLabel: messages.view,
        actionLinkOptions: {
          to: '/bookmarks/$folderId',
          params: { folderId: folderId ?? 'all' },
        },
      };

      if (features.bookmarkFolders && typeof folderId !== 'string') {
        opts = {
          actionLabel: messages.selectFolder,
          action: () => {
            openModal('SELECT_BOOKMARK_FOLDER', {
              statusId,
            });
          },
        };
      }

      toast.success(
        typeof folderId === 'string' ? messages.folderChanged : messages.bookmarkAdded,
        opts,
      );
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
    onMutate: () => updateStatus(statusId, { bookmarked: false }, queryClient),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient),
    onSettled: (status) => {
      dispatch(importEntities({ statuses: [status] }));

      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>(
        {
          queryKey: queryKeys.statusLists.bookmarksRoot,
          exact: false,
        },
        filterById(statusId),
      );

      toast.success(messages.bookmarkRemoved);
    },
  });
};

const usePinStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { data: account } = useOwnAccount();

  return useMutation({
    mutationKey: ['statuses', 'pin', statusId],
    mutationFn: () => client.statuses.pinStatus(statusId),
    onMutate: () => updateStatus(statusId, { pinned: true }, queryClient),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient),
    onSuccess: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: queryKeys.statusLists.pins(account!.id) });
      dispatch<InteractionsAction>({
        type: PIN_SUCCESS,
        statusId: status.id,
        accountId: status.account.id,
      });
    },
  });
};

const useUnpinStatus = (statusId: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { data: account } = useOwnAccount();

  return useMutation({
    mutationKey: ['statuses', 'unpin', statusId],
    mutationFn: () => client.statuses.unpinStatus(statusId),
    onMutate: () => updateStatus(statusId, { pinned: false }, queryClient),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient),
    onSuccess: (status) => {
      dispatch(importEntities({ statuses: [status] }));
      queryClient.setQueryData(queryKeys.statusLists.pins(account!.id), filterById(statusId));
      dispatch<InteractionsAction>({
        type: UNPIN_SUCCESS,
        statusId: status.id,
        accountId: status.account.id,
      });
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
  type MinifiedEmojiReaction,
};
