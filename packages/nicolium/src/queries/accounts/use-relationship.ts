import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { batcher } from '@/api/batcher';
import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useOwnAccount } from '@/hooks/use-own-account';
import { queryKeys } from '@/queries/keys';
import { useContextsActions } from '@/stores/contexts';
import { useTimelinesActions } from '@/stores/timelines';

import type {
  BlockAccountParams,
  FollowAccountParams,
  MuteAccountParams,
  Relationship,
} from 'pl-api';

const updateRelationship = (
  accountId: string,
  changes: Partial<Relationship> | ((relationship: Relationship) => Relationship),
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  const previousRelationship = queryClient.getQueryData(
    queryKeys.accountRelationships.show(accountId),
  );
  if (!previousRelationship) return;

  const newRelationship =
    typeof changes === 'function'
      ? changes(previousRelationship)
      : { ...previousRelationship, ...changes };
  queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), newRelationship);

  return { previousRelationship };
};

const restorePreviousRelationship = (
  accountId: string,
  context: { previousRelationship?: Relationship } | undefined,
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  if (context?.previousRelationship) {
    queryClient.setQueryData(
      queryKeys.accountRelationships.show(accountId),
      context.previousRelationship,
    );
  }
};

const useRelationshipQuery = (accountId?: string) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  return useQuery({
    queryKey: queryKeys.accountRelationships.show(accountId!),
    queryFn: () =>
      batcher
        .relationships(client)
        .fetch(accountId!)
        .then((data) => data || undefined),
    enabled: isLoggedIn && !!accountId,
  });
};

const useRelationshipsQuery = (accountIds?: Array<string>) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  const queries = useMemo(
    () =>
      isLoggedIn && accountIds
        ? accountIds.map((accountId) => ({
            queryKey: queryKeys.accountRelationships.show(accountId),
            queryFn: () =>
              batcher
                .relationships(client)
                .fetch(accountId)
                .then((data) => data || undefined),
            enabled: !!accountId,
          }))
        : [],
    [isLoggedIn, accountIds?.join(',')],
  );

  return useQueries({ queries });
};

const useFollowAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.accountRelationships.show(accountId),
    mutationFn: (params?: FollowAccountParams) => client.accounts.followAccount(accountId, params),
    onMutate: (params) => {
      return updateRelationship(
        accountId,
        (relationship) => ({
          ...relationship,
          requested: !relationship.following,
          notifying: params?.notify ?? relationship.notifying,
          showing_reblogs: params?.reblogs ?? relationship.showing_reblogs,
          notifying_reblogs: params?.notify_reblogs ?? relationship.notifying_reblogs,
          notifying_replies: params?.notify_replies ?? relationship.notifying_replies,
        }),
        queryClient,
      );
    },
    onError: (_err, _variables, context) => {
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), data);
    },
  });
};

const useUnfollowAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.accountRelationships.show(accountId),
    mutationFn: () => client.accounts.unfollowAccount(accountId),
    onMutate: () =>
      updateRelationship(
        accountId,
        {
          following: false,
          requested: false,
          notifying: false,
          notifying_reblogs: false,
          notifying_replies: false,
          showing_reblogs: false,
        },
        queryClient,
      ),
    onError: (_err, _variables, context) => {
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), data);
    },
  });
};

const useBlockAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const { filterContexts } = useContextsActions();
  const { filterTimelines } = useTimelinesActions();

  return useMutation({
    mutationKey: queryKeys.accountRelationships.show(accountId),
    mutationFn: (params?: BlockAccountParams) => client.filtering.blockAccount(accountId, params),
    onMutate: () =>
      updateRelationship(
        accountId,
        {
          blocking: true,
          followed_by: false,
          following: false,
          notifying: false,
          notifying_reblogs: false,
          notifying_replies: false,
          requested: false,
        },
        queryClient,
      ),
    onError: (_err, _variables, context) => {
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), data);

      queryClient.setQueryData(queryKeys.suggestions.all, (suggestions) =>
        suggestions
          ? suggestions.filter((suggestion) => suggestion.account_id !== accountId)
          : undefined,
      );

      queryClient.invalidateQueries({
        queryKey: queryKeys.accountsLists.blocked,
      });

      // Pass in entire statuses map so we can use it to filter stuff in different parts of the reducers
      filterContexts(data);
      filterTimelines(data.id);
    },
  });
};

const useUnblockAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.accountRelationships.show(accountId),
    mutationFn: () => client.filtering.unblockAccount(accountId),
    onMutate: () =>
      updateRelationship(
        accountId,
        {
          blocking: false,
        },
        queryClient,
      ),
    onError: (_err, _variables, context) => {
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), data);
    },
  });
};

const useMuteAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const { filterContexts } = useContextsActions();
  const { filterTimelines } = useTimelinesActions();

  return useMutation({
    mutationKey: queryKeys.accountRelationships.show(accountId),
    mutationFn: (params?: MuteAccountParams) => client.filtering.muteAccount(accountId, params),
    onMutate: () =>
      updateRelationship(
        accountId,
        {
          muting: true,
        },
        queryClient,
      ),
    onError: (_err, _variables, context) => {
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), data);

      queryClient.setQueryData(queryKeys.suggestions.all, (suggestions) =>
        suggestions
          ? suggestions.filter((suggestion) => suggestion.account_id !== accountId)
          : undefined,
      );

      queryClient.invalidateQueries({
        queryKey: queryKeys.accountsLists.muted,
      });

      // Pass in entire statuses map so we can use it to filter stuff in different parts of the reducers
      filterContexts(data);
      filterTimelines(data.id);
    },
  });
};

const useUnmuteAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.accountRelationships.show(accountId),
    mutationFn: () => client.filtering.unmuteAccount(accountId),
    onMutate: () =>
      updateRelationship(
        accountId,
        {
          muting: false,
        },
        queryClient,
      ),
    onError: (_err, _variables, context) => {
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), data);
    },
  });
};

const usePinAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const { data: account } = useOwnAccount();

  return useMutation({
    mutationKey: queryKeys.accountRelationships.show(accountId),
    mutationFn: () => client.accounts.pinAccount(accountId),
    onMutate: () =>
      updateRelationship(
        accountId,
        {
          endorsed: true,
        },
        queryClient,
      ),
    onError: (_err, _variables, context) => {
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.accountsLists.endorsedAccounts(account!.id),
      });
    },
  });
};

const useUnpinAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const { data: account } = useOwnAccount();

  return useMutation({
    mutationKey: queryKeys.accountRelationships.show(accountId),
    mutationFn: () => client.accounts.unpinAccount(accountId),
    onMutate: () =>
      updateRelationship(
        accountId,
        {
          endorsed: false,
        },
        queryClient,
      ),
    onError: (_err, _variables, context) => {
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.accountsLists.endorsedAccounts(account!.id),
      });
    },
  });
};

const useRemoveAccountFromFollowersMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.accountRelationships.show(accountId),
    mutationFn: () => client.accounts.removeAccountFromFollowers(accountId),
    onMutate: () =>
      updateRelationship(
        accountId,
        {
          followed_by: false,
        },
        queryClient,
      ),
    onError: (_err, _variables, context) => {
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), data);
    },
  });
};

const useUpdateAccountNoteMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['accountNote', accountId],
    mutationFn: (note: string) => client.accounts.updateAccountNote(accountId, note),
    onMutate: (note) =>
      updateRelationship(
        accountId,
        {
          note,
        },
        queryClient,
      ),
    onError: (_err, _variables, context) => {
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.accountRelationships.show(accountId), data);
    },
  });
};

export {
  useRelationshipQuery,
  useRelationshipsQuery,
  useFollowAccountMutation,
  useUnfollowAccountMutation,
  useBlockAccountMutation,
  useUnblockAccountMutation,
  useMuteAccountMutation,
  useUnmuteAccountMutation,
  usePinAccountMutation,
  useUnpinAccountMutation,
  useRemoveAccountFromFollowersMutation,
  useUpdateAccountNoteMutation,
};
