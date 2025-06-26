import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';

const useMfaConfig = () => {
  const client = useClient();

  return useQuery({
    queryKey: ['settings', 'mfa'],
    queryFn: () => client.settings.mfa.getMfaSettings(),
  });
};

const useConfirmMfa = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings', 'mfa'],
    mutationFn: ({ code, password }: { code: string; password: string }) => client.settings.mfa.confirmMfaSetup('totp', code, password),
    onSuccess: () => {
      queryClient.setQueryData(['settings', 'mfa'], {
        settings: {
          enabled: true,
          totp: true,
        },
      });
    },
  });
};

const useDisableMfa = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings', 'mfa'],
    mutationFn: (password: string) => client.settings.mfa.disableMfa('totp', password),
    onSuccess: () => {
      queryClient.setQueryData(['settings', 'mfa'], {
        settings: {
          enabled: false,
          totp: false,
        },
      });
    },
  });
};

export { useMfaConfig, useConfirmMfa, useDisableMfa };
