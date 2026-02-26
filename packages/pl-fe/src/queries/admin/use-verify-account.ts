import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';

import { queryKeys } from '../keys';

import type { Account } from 'pl-api';

const setVerified = (account: Account | undefined, verified: boolean): Account | undefined => {
  if (!account) return account;

  const existingTags = account.__meta?.pleroma?.tags ?? [];
  const tags = existingTags.filter((tag: string) => tag !== 'verified');
  if (verified) tags.push('verified');

  return {
    ...account,
    __meta: account.__meta?.pleroma
      ? {
          ...account.__meta,
          pleroma: {
            ...account.__meta.pleroma,
            tags,
          },
        }
      : account.__meta,
    verified,
  };
};

const useAdminVerifyAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'accounts', accountId, 'verify'],
    mutationFn: () => client.admin.accounts.tagUser(accountId, ['verified']),
    onMutate: () => {
      queryClient.setQueryData(queryKeys.accounts.show(accountId), (account) =>
        setVerified(account, true),
      );
    },
    onError: () => {
      queryClient.setQueryData(queryKeys.accounts.show(accountId), (account) =>
        setVerified(account, false),
      );
    },
  });
};

const useAdminUnverifyAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'accounts', accountId, 'unverify'],
    mutationFn: () => client.admin.accounts.untagUser(accountId, ['verified']),
    onMutate: () => {
      queryClient.setQueryData(queryKeys.accounts.show(accountId), (account) =>
        setVerified(account, false),
      );
    },
    onError: () => {
      queryClient.setQueryData(queryKeys.accounts.show(accountId), (account) =>
        setVerified(account, true),
      );
    },
  });
};

export { useAdminVerifyAccountMutation, useAdminUnverifyAccountMutation };
