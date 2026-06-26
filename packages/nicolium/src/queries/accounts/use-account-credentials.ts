import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useCurrentAccount } from '@/contexts/current-account-context';
import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey, useAppQuery } from '@/queries/query';
import { useAuthActions } from '@/stores/auth';

import type { UpdateCredentialsParams } from 'pl-api';

const useCredentialAccount = (enabled = true) => {
  const client = useClient();
  const currentAccount = useCurrentAccount();

  return useAppQuery({
    queryKey: queryKeys.accountCredentials.show(currentAccount as string),
    queryFn: () => client.settings.verifyCredentials(),
    enabled: currentAccount !== 'unauthenticated' && enabled,
  });
};

const useUpdateCredentials = () => {
  const client = useClient();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();
  const { setCurrentAccount } = useAuthActions();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.accountCredentials.show(currentAccount as string),
    mutationFn: (params: UpdateCredentialsParams) => client.settings.updateCredentials(params),
    onSuccess: (response) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accountCredentials.show(currentAccount as string), scopeUrl),
        response,
      );
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accounts.show(response.id), scopeUrl),
        response,
      );
      setCurrentAccount(response);
    },
  });
};

export { useCredentialAccount, useUpdateCredentials };
