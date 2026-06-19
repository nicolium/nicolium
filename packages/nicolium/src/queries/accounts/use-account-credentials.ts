import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useCurrentAccount } from '@/contexts/current-account-context';
import { useClient } from '@/hooks/use-client';
import { queryKeys } from '@/queries/keys';
import { useAppQuery } from '@/queries/query';
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

  return useMutation({
    mutationKey: queryKeys.accountCredentials.show(currentAccount as string),
    mutationFn: (params: UpdateCredentialsParams) => client.settings.updateCredentials(params),
    onSuccess: (response) => {
      queryClient.setQueryData(
        queryKeys.accountCredentials.show(currentAccount as string),
        response,
      );
      queryClient.setQueryData(queryKeys.accounts.show(response.id), response);
      setCurrentAccount(response);
    },
  });
};

export { useCredentialAccount, useUpdateCredentials };
