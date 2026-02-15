import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ACCOUNT_BLOCK_SUCCESS, ACCOUNT_MUTE_SUCCESS, type AccountsAction } from '@/actions/accounts';
import { batcher } from '@/api/batcher';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';

import type { MinifiedSuggestion } from '../trends/use-suggested-accounts';
import type { BlockAccountParams, FollowAccountParams, MuteAccountParams, Relationship } from 'pl-api';

const updateRelationship = (accountId: string, changes: Partial<Relationship> | ((relationship: Relationship) => Relationship), queryClient: ReturnType<typeof useQueryClient>) => {
  const previousRelationship = queryClient.getQueryData<Relationship>(['accountRelationships', accountId]);
  if (!previousRelationship) return;

  const newRelationship = typeof changes === 'function' ? changes(previousRelationship) : { ...previousRelationship, ...changes };
  queryClient.setQueryData(['accountRelationships', accountId], newRelationship);

  return { previousRelationship };
};

const restorePreviousRelationship = (
  accountId: string,
  context: { previousRelationship?: Relationship } | undefined,
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  if (context?.previousRelationship) {
    queryClient.setQueryData(['accountRelationships', accountId], context.previousRelationship);
  }
};

const useRelationshipQuery = (accountId?: string) => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();

  return useQuery({
    queryKey: ['accountRelationships', accountId],
    queryFn: () => batcher.relationships(client).fetch(accountId!).then((data) => data || undefined),
    enabled: isLoggedIn && !!accountId,
  });
};

const useFollowAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['accountRelationships', accountId],
    mutationFn: (params?: FollowAccountParams) => client.accounts.followAccount(accountId, params),
    onMutate: (params) => {
      return updateRelationship(accountId, (relationship) => ({
        ...relationship,
        requested: !relationship.following,
        notifying: params?.notify ?? relationship.notifying,
        showing_reblogs: params?.reblogs ?? relationship.showing_reblogs,
      }), queryClient);
    },
    onError: (_err, _variables, context) =>{
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accountRelationships', accountId], data);
    },
  });
};

const useUnfollowAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['accountRelationships', accountId],
    mutationFn: () => client.accounts.unfollowAccount(accountId),
    onMutate: () => updateRelationship(accountId, {
      following: false,
      requested: false,
      notifying: false,
      showing_reblogs: false,
    }, queryClient),
    onError: (_err, _variables, context) =>{
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accountRelationships', accountId], data);
    },
  });
};

const useBlockAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationKey: ['accountRelationships', accountId],
    mutationFn: (params?: BlockAccountParams) => client.filtering.blockAccount(accountId, params),
    onMutate: () => updateRelationship(accountId, {
      blocking: true,
      followed_by: false,
      following: false,
      notifying: false,
      requested: false,
    }, queryClient),
    onError: (_err, _variables, context) =>{
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accountRelationships', accountId], data);

      queryClient.setQueryData<Array<MinifiedSuggestion>>(['suggestions'], suggestions => suggestions
        ? suggestions.filter((suggestion) => suggestion.account_id !== accountId)
        : undefined);

      queryClient.invalidateQueries({
        queryKey: ['accountsLists', 'blocked'],
      });

      // Pass in entire statuses map so we can use it to filter stuff in different parts of the reducers
      return dispatch<AccountsAction>((dispatch, getState) => dispatch({
        type: ACCOUNT_BLOCK_SUCCESS,
        relationship: data,
        statuses: getState().statuses,
      }));
    },
  });
};

const useUnblockAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['accountRelationships', accountId],
    mutationFn: () => client.filtering.unblockAccount(accountId),
    onMutate: () => updateRelationship(accountId, {
      blocking: false,
    }, queryClient),
    onError: (_err, _variables, context) =>{
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accountRelationships', accountId], data);
    },
  });
};

const useMuteAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationKey: ['accountRelationships', accountId],
    mutationFn: (params?: MuteAccountParams) => client.filtering.muteAccount(accountId, params),
    onMutate: () => updateRelationship(accountId, {
      muting: true,
    }, queryClient),
    onError: (_err, _variables, context) =>{
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accountRelationships', accountId], data);

      queryClient.setQueryData<Array<MinifiedSuggestion>>(['suggestions'], suggestions => suggestions
        ? suggestions.filter((suggestion) => suggestion.account_id !== accountId)
        : undefined);

      queryClient.invalidateQueries({
        queryKey: ['accountsLists', 'muted'],
      });

      // Pass in entire statuses map so we can use it to filter stuff in different parts of the reducers
      return dispatch<AccountsAction>((dispatch, getState) => dispatch({
        type: ACCOUNT_MUTE_SUCCESS,
        relationship: data,
        statuses: getState().statuses,
      }));
    },
  });
};

const useUnmuteAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['accountRelationships', accountId],
    mutationFn: () => client.filtering.unmuteAccount(accountId),
    onMutate: () => updateRelationship(accountId, {
      muting: false,
    }, queryClient),
    onError: (_err, _variables, context) =>{
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accountRelationships', accountId], data);
    },
  });
};

const usePinAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const { me } = useLoggedIn();

  return useMutation({
    mutationKey: ['accountRelationships', accountId],
    mutationFn: () => client.accounts.pinAccount(accountId),
    onMutate: () => updateRelationship(accountId, {
      endorsed: true,
    }, queryClient),
    onError: (_err, _variables, context) =>{
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accountRelationships', accountId], data);
      queryClient.invalidateQueries({
        queryKey: ['accountsLists', 'endorsedAccounts', me],
      });
    },
  });
};

const useUnpinAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const { me } = useLoggedIn();

  return useMutation({
    mutationKey: ['accountRelationships', accountId],
    mutationFn: () => client.accounts.unpinAccount(accountId),
    onMutate: () => updateRelationship(accountId, {
      endorsed: false,
    }, queryClient),
    onError: (_err, _variables, context) =>{
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accountRelationships', accountId], data);
      queryClient.invalidateQueries({
        queryKey: ['accountsLists', 'endorsedAccounts', me],
      });
    },
  });
};

const useRemoveAccountFromFollowersMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['accountRelationships', accountId],
    mutationFn: () => client.accounts.removeAccountFromFollowers(accountId),
    onMutate: () => updateRelationship(accountId, {
      followed_by: false,
    }, queryClient),
    onError: (_err, _variables, context) =>{
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accountRelationships', accountId], data);
    },
  });
};

const useUpdateAccountNoteMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['accountNote', accountId],
    mutationFn: (note: string) => client.accounts.updateAccountNote(accountId, note),
    onMutate: (note) => updateRelationship(accountId, {
      note,
    }, queryClient),
    onError: (_err, _variables, context) =>{
      restorePreviousRelationship(accountId, context, queryClient);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['accountRelationships', accountId], data);
    },
  });
};

export {
  useRelationshipQuery,
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
