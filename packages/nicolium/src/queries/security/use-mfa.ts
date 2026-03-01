import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

import { queryKeys } from '../keys';

const useMfaConfig = () => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: queryKeys.settings.mfa,
    queryFn: () => client.settings.mfa.getMfaSettings(),
    enabled: features.manageMfa,
  });
};

const useConfirmMfa = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['settings', 'mfa'],
    mutationFn: ({ code, password }: { code: string; password: string }) =>
      client.settings.mfa.confirmMfaSetup('totp', code, password),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.settings.mfa, {
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
      queryClient.setQueryData(queryKeys.settings.mfa, {
        settings: {
          enabled: false,
          totp: false,
        },
      });
    },
  });
};

export { useMfaConfig, useConfirmMfa, useDisableMfa };
