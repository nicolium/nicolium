import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey, useAppQuery } from '@/queries/query';
import { useClient } from '@/stores/auth';

import type { UpdateCredentialsParams } from 'pl-api';

const useCredentialAccount = (enabled = true) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.accountCredentials.show('meow'),
    queryFn: () => client.settings.verifyCredentials(),
    enabled,
  });
};

const useUpdateCredentials = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  // const { setCurrentAccount } = useAuthActions();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.accountCredentials.show('meow'),
    mutationFn: (params: UpdateCredentialsParams) => client.settings.updateCredentials(params),
    onSuccess: (response) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accountCredentials.show('meow'), scopeUrl),
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
