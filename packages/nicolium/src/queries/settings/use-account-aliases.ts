import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defineMessages } from 'react-intl';

import { useClient } from '@/hooks/use-client';
import toast from '@/toast';

import { queryKeys } from '../keys';

const messages = defineMessages({
  createSuccess: {
    id: 'aliases.success.add',
    defaultMessage: 'Account alias created',
  },
  removeSuccess: {
    id: 'aliases.success.remove',
    defaultMessage: 'Account alias removed',
  },
});

const useAccountAliases = () => {
  const client = useClient();

  return useQuery({
    queryKey: queryKeys.settings.accountAliases,
    queryFn: async (): Promise<Array<string>> =>
      (await client.settings.getAccountAliases()).aliases,
  });
};

const useAddAccountAlias = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings', 'accountAliases'],
    mutationFn: (acct: string) => client.settings.addAccountAlias(acct),
    onSuccess: () => {
      toast.success(messages.createSuccess);
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.accountAliases,
      }),
  });
};

const useDeleteAccountAlias = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings', 'accountAliases'],
    mutationFn: (acct: string) => client.settings.deleteAccountAlias(acct),
    onSuccess: () => {
      toast.success(messages.removeSuccess);
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.accountAliases,
      }),
  });
};

export { useAccountAliases, useAddAccountAlias, useDeleteAccountAlias };
