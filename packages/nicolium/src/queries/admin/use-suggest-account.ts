import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';

const useAdminSuggestAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'accounts', accountId, 'suggest'],
    mutationFn: () => client.admin.accounts.suggestUser(accountId),
    onMutate: () => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl),
        (account) => (account ? { ...account, is_suggested: true } : undefined),
      );
    },
    onError: () => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl),
        (account) => (account ? { ...account, is_suggested: false } : undefined),
      );
    },
  });
};

const useAdminUnsuggestAccountMutation = (accountId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['admin', 'accounts', accountId, 'unsuggest'],
    mutationFn: () => client.admin.accounts.unsuggestUser(accountId),
    onMutate: () => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl),
        (account) => (account ? { ...account, is_suggested: false } : undefined),
      );
    },
    onError: () => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accounts.show(accountId), scopeUrl),
        (account) => (account ? { ...account, is_suggested: true } : undefined),
      );
    },
  });
};

export { useAdminSuggestAccountMutation, useAdminUnsuggestAccountMutation };
