import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';

import type { Account } from 'pl-api';

const useAdminSuggestAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'accounts', accountId, 'suggest'],
    mutationFn: () => client.admin.accounts.suggestUser(accountId),
    onMutate: () => {
      queryClient.setQueryData<Account>(['accounts', accountId], (account) =>
        account ? { ...account, is_suggested: true } : undefined,
      );
    },
    onError: () => {
      queryClient.setQueryData<Account>(['accounts', accountId], (account) =>
        account ? { ...account, is_suggested: false } : undefined,
      );
    },
  });
};

const useAdminUnsuggestAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'accounts', accountId, 'unsuggest'],
    mutationFn: () => client.admin.accounts.unsuggestUser(accountId),
    onMutate: () => {
      queryClient.setQueryData<Account>(['accounts', accountId], (account) =>
        account ? { ...account, is_suggested: false } : undefined,
      );
    },
    onError: () => {
      queryClient.setQueryData<Account>(['accounts', accountId], (account) =>
        account ? { ...account, is_suggested: true } : undefined,
      );
    },
  });
};

export { useAdminSuggestAccountMutation, useAdminUnsuggestAccountMutation };
