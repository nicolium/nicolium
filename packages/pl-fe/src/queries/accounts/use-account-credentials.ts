import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { patchMeSuccess } from '@/actions/me';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';

import type { UpdateCredentialsParams } from 'pl-api';

const useCredentialAccount = (enabled = true) => {
  const client = useClient();
  const currentAccount = useCurrentAccount();

  return useQuery({
    queryKey: [currentAccount, 'credentialAccount'],
    queryFn: () => client.settings.verifyCredentials(),
    enabled: currentAccount !== 'unauthenticated' && enabled,
  });
};

const useUpdateCredentials = () => {
  const client = useClient();
  const currentAccount = useCurrentAccount();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [currentAccount, 'credentialAccount'],
    mutationFn: (params: UpdateCredentialsParams) => client.settings.updateCredentials(params),
    onSuccess: (response) => {
      queryClient.setQueryData([currentAccount, 'credentialAccount'], response);
      dispatch(patchMeSuccess(response));
    },
  });
};

export { useCredentialAccount, useUpdateCredentials };
