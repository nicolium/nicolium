import {
  type InfiniteData,
  type QueryKey,
  notifyManager,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { create } from 'mutative';
import { defineMessages, useIntl } from 'react-intl';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';
import { useImportEntities } from '@/queries/utils/import-entities';
import { makePaginatedResponseQuery } from '@/queries/utils/make-paginated-response-query';
import { minifyAccountList } from '@/queries/utils/minify-list';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import toast, { type IToastOptions } from '@/toast';
import { supportsEmojiReacts } from '@/utils/check-instance-capability';
import { simulateEmojiReact, simulateUnEmojiReact } from '@/utils/emoji-reacts';

import { queryKeys } from '../keys';
import { filterById } from '../utils/filter-id';

import type { NormalizedStatus } from '@/queries/statuses/normalize';
import type { EmojiReaction, PaginatedResponse, Status } from 'pl-api';

const messages = defineMessages({
  bookmarkAdded: { id: 'status.bookmarked', defaultMessage: 'Bookmark added.' },
  bookmarkRemoved: { id: 'status.unbookmarked', defaultMessage: 'Bookmark removed.' },
  folderChanged: { id: 'status.bookmark_folder_changed', defaultMessage: 'Changed folder' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  selectFolder: { id: 'status.bookmark.select_folder', defaultMessage: 'Select folder' },
  emojiReactionsUnsupported: {
    id: 'emoji_reactions.unsupported_by_remote',
    defaultMessage:
      '@{acct}’s instance most likely doesn’t understand emoji reactions. The user will not get notified of the reaction.',
  },
  reblogScheduled: { id: 'status.reblog_scheduled', defaultMessage: 'Repost scheduled' },
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
  changes: Partial<NormalizedStatus> | ((status: NormalizedStatus) => NormalizedStatus | void),
  queryClient: ReturnType<typeof useQueryClient>,
  scopeUrl: string,
) => {
  const previousStatus = queryClient.getQueryData<NormalizedStatus>(
    scopedQueryKey(queryKeys.statuses.show(statusId), scopeUrl),
  );
  if (!previousStatus) return;

  const newStatus =
    typeof changes === 'function'
      ? create(previousStatus, changes)
      : { ...previousStatus, ...changes };
  queryClient.setQueryData(scopedQueryKey(queryKeys.statuses.show(statusId), scopeUrl), newStatus);

  return { previousStatus };
};

const restorePreviousStatus = (
  statusId: string,
  context: { previousStatus?: NormalizedStatus } | undefined,
  queryClient: ReturnType<typeof useQueryClient>,
  scopeUrl: string,
) => {
  if (context?.previousStatus) {
    queryClient.setQueryData(
      scopedQueryKey(queryKeys.statuses.show(statusId), scopeUrl),
      context.previousStatus,
    );
  }
};

const useStatusReactions = (statusId: string, emoji?: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useAppQuery({
    queryKey: queryKeys.accountsLists.statusReactions(statusId, emoji),
    queryFn: () =>
      client.statuses.getStatusReactions(statusId, emoji).then((reactions) => {
        notifyManager.batch(() => {
          for (const { accounts } of reactions) {
            for (const account of accounts) {
              queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
            }
          }
        });

        return reactions.map(minifyEmojiReaction);
      }),
    placeholderData: (previousData) => previousData?.filter(({ name }) => name === emoji),
  });
};

const useEmojiReactMutation = (statusId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const importEntities = useImportEntities();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['statuses', 'emojiReact', statusId],
    mutationFn: async (emoji: string) =>
      await client.statuses.createStatusReaction(statusId, emoji),
    onMutate: (emoji) => {
      return updateStatus(
        statusId,
        (status) => {
          const customEmoji =
            queryClient
              .getQueryData(scopedQueryKey(queryKeys.instance.customEmojis, scopeUrl))
              ?.find((e) => e.shortcode === emoji) ||
            status.emoji_reactions?.find((r) => r.name === emoji);

          return {
            ...status,
            emoji_reactions: simulateEmojiReact(status.emoji_reactions, emoji, customEmoji?.url),
          };
        },
        queryClient,
        scopeUrl,
      );
    },
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient, scopeUrl),
    onSettled: (status) => {
      importEntities({ statuses: [status] });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accountsLists.statusReactions(statusId), scopeUrl),
      });
    },
  });
};

const useEmojiUnreactMutation = (statusId: string) => {
  const client = useClient();
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { checkEmojiReactsSupport } = useSettings();
  const importEntities = useImportEntities();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['statuses', 'emojiUnreact', statusId],
    mutationFn: async (emoji: string) => {
      const status = await client.statuses.deleteStatusReaction(statusId, emoji);

      if (checkEmojiReactsSupport && !status.account.local) {
        supportsEmojiReacts(status.account.ap_id ?? status.account.url)
          .then((result) => {
            if (result === 'false') {
              toast.info(
                intl.formatMessage(messages.emojiReactionsUnsupported, {
                  acct: status.account.acct,
                }),
              );
            }
          })
          .catch(() => {});
      }

      return status;
    },
    onMutate: (emoji) =>
      updateStatus(
        statusId,
        (status) => ({
          ...status,
          emoji_reactions: simulateUnEmojiReact(status.emoji_reactions, emoji),
        }),
        queryClient,
        scopeUrl,
      ),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient, scopeUrl),
    onSettled: (status) => {
      importEntities({ statuses: [status] });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accountsLists.statusReactions(statusId), scopeUrl),
      });
    },
  });
};

const makeStatusToggleMutation =
  ({
    mutationKey,
    mutationFn,
    apply,
    listKey,
  }: {
    mutationKey: string;
    mutationFn: (client: ReturnType<typeof useClient>, statusId: string) => Promise<Status>;
    apply: (status: NormalizedStatus) => void;
    listKey: (statusId: string) => QueryKey;
  }) =>
  (statusId: string) => {
    const client = useClient();
    const queryClient = useQueryClient();
    const importEntities = useImportEntities();
    const scopeUrl = useScopeUrl();

    return useMutation({
      mutationKey: ['statuses', mutationKey, statusId],
      mutationFn: () => mutationFn(client, statusId),
      onMutate: () => updateStatus(statusId, apply, queryClient, scopeUrl),
      onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient, scopeUrl),
      onSettled: (status) => {
        importEntities({ statuses: [status] });
        queryClient.invalidateQueries({ queryKey: scopedQueryKey(listKey(statusId), scopeUrl) });
      },
    });
  };

const useFavouriteStatus = makeStatusToggleMutation({
  mutationKey: 'favourite',
  mutationFn: (client, statusId) => client.statuses.favouriteStatus(statusId),
  apply: (status) => {
    status.favourited = true;
    status.favourites_count += 1;
  },
  listKey: queryKeys.accountsLists.statusFavourites,
});

const useUnfavouriteStatus = makeStatusToggleMutation({
  mutationKey: 'favourite',
  mutationFn: (client, statusId) => client.statuses.unfavouriteStatus(statusId),
  apply: (status) => {
    status.favourited = false;
    status.favourites_count = Math.max(0, status.favourites_count - 1);
  },
  listKey: queryKeys.accountsLists.statusFavourites,
});

const useDislikeStatus = makeStatusToggleMutation({
  mutationKey: 'dislike',
  mutationFn: (client, statusId) => client.statuses.dislikeStatus(statusId),
  apply: (status) => {
    status.disliked = true;
    status.dislikes_count += 1;
  },
  listKey: queryKeys.accountsLists.statusDislikes,
});

const useUndislikeStatus = makeStatusToggleMutation({
  mutationKey: 'dislike',
  mutationFn: (client, statusId) => client.statuses.undislikeStatus(statusId),
  apply: (status) => {
    status.disliked = false;
    status.dislikes_count = Math.max(0, status.dislikes_count - 1);
  },
  listKey: queryKeys.accountsLists.statusDislikes,
});

const useReblogStatus = (statusId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const importEntities = useImportEntities();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['statuses', 'reblog', statusId],
    mutationFn: ({ visibility, scheduledAt }: { visibility?: string; scheduledAt?: string } = {}) =>
      client.statuses.reblogStatus(statusId, visibility, scheduledAt),
    onMutate: () =>
      updateStatus(
        statusId,
        (status) => ({
          ...status,
          reblogged: true,
          reblogs_count: status.reblogs_count + 1,
        }),
        queryClient,
        scopeUrl,
      ),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient, scopeUrl),
    onSuccess: (status) => {
      if ('params' in status) {
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.scheduledStatuses.all, scopeUrl),
        });
        toast.success(messages.reblogScheduled, {
          actionLabel: messages.view,
          actionLinkOptions: { to: '/draft_statuses' },
        });
      } else {
        importEntities({ statuses: [status] });
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.accountsLists.statusReblogs(statusId), scopeUrl),
        });
      }
    },
  });
};

const useUnreblogStatus = (statusId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const importEntities = useImportEntities();
  const scopeUrl = useScopeUrl();

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
        scopeUrl,
      ),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient, scopeUrl),
    onSuccess: (status) => {
      importEntities({ statuses: [status] });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accountsLists.statusReblogs(statusId), scopeUrl),
      });
    },
  });
};

const useBookmarkStatus = (statusId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const features = useFeatures();
  const { openModal } = useModalsActions();
  const importEntities = useImportEntities();
  const scopeUrl = useScopeUrl();

  let previouslyBookmarked = false;
  let previousFolder: string | null;

  return useMutation({
    mutationKey: ['statuses', 'bookmark', statusId],
    mutationFn: (folderId?: string) => {
      const status = queryClient.getQueryData(
        scopedQueryKey(queryKeys.statuses.show(statusId), scopeUrl),
      );
      previouslyBookmarked = status?.bookmarked ?? false;
      previousFolder = status?.bookmark_folder ?? null;
      return client.statuses.bookmarkStatus(statusId, folderId);
    },
    onMutate: () => updateStatus(statusId, { bookmarked: true }, queryClient, scopeUrl),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient, scopeUrl),
    onSettled: (status, _, folderId) => {
      importEntities({ statuses: [status] });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accountsLists.statusReblogs(statusId), scopeUrl),
      });

      if (previousFolder) {
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.statusLists.bookmarks(previousFolder), scopeUrl),
          filterById(statusId),
        );
      }

      if (!previouslyBookmarked) {
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.statusLists.bookmarks(undefined), scopeUrl),
        });
      }

      if (folderId) {
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.statusLists.bookmarks(folderId), scopeUrl),
        });
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
  const queryClient = useQueryClient();
  const importEntities = useImportEntities();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['statuses', 'bookmark', statusId],
    mutationFn: () => client.statuses.unbookmarkStatus(statusId),
    onMutate: () => updateStatus(statusId, { bookmarked: false }, queryClient, scopeUrl),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient, scopeUrl),
    onSettled: (status) => {
      importEntities({ statuses: [status] });

      queryClient.setQueriesData<InfiniteData<PaginatedResponse<string>>>(
        {
          queryKey: scopedQueryKey(queryKeys.statusLists.bookmarksRoot, scopeUrl),
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
  const queryClient = useQueryClient();
  const { data: account } = useOwnAccount();
  const importEntities = useImportEntities();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['statuses', 'pin', statusId],
    mutationFn: () => client.statuses.pinStatus(statusId),
    onMutate: () => updateStatus(statusId, { pinned: true }, queryClient, scopeUrl),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient, scopeUrl),
    onSuccess: (status) => {
      importEntities({ statuses: [status] });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.statusLists.pins(account!.id), scopeUrl),
      });
    },
  });
};

const useUnpinStatus = (statusId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const { data: account } = useOwnAccount();
  const importEntities = useImportEntities();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['statuses', 'unpin', statusId],
    mutationFn: () => client.statuses.unpinStatus(statusId),
    onMutate: () => updateStatus(statusId, { pinned: false }, queryClient, scopeUrl),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient, scopeUrl),
    onSuccess: (status) => {
      importEntities({ statuses: [status] });
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.statusLists.pins(account!.id), scopeUrl),
        filterById(statusId),
      );
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
  useEmojiReactMutation,
  useEmojiUnreactMutation,
  updateStatus,
  restorePreviousStatus,
  type MinifiedEmojiReaction,
};
