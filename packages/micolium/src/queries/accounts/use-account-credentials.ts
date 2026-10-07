import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient, useCurrentAccount } from '@/contexts/current-account-context';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import type { UpdateCredentialsParams } from 'pl-api';

const useCredentialAccount = (enabled = true) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.accountCredentials.show('self'),
    queryFn: () => client.settings.verifyCredentials(),
    enabled,
  });
};

const useUpdateCredentials = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  // const { setCurrentAccount } = useAuthActions();
  const scopeUrl = useCurrentAccount();

  return useMutation({
    mutationKey: queryKeys.accountCredentials.show('self'),
    mutationFn: (params: UpdateCredentialsParams) => client.settings.updateCredentials(params),
    onSuccess: (response) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accountCredentials.show('self'), scopeUrl),
        response,
      );
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accounts.show(response.id), scopeUrl),
        response,
      );
      // setCurrentAccount(response);
    },
  });
};

export { useCredentialAccount, useUpdateCredentials };
