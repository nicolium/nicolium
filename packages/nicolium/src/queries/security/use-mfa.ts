import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const useMfaConfig = () => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery({
    queryKey: queryKeys.settings.mfa,
    queryFn: () => client.settings.mfa.getMfaSettings(),
    enabled: features.manageMfa,
  });
};

const useConfirmMfa = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['settings', 'mfa'],
    mutationFn: ({ code, password }: { code: string; password: string }) =>
      client.settings.mfa.confirmMfaSetup('totp', code, password),
    onSuccess: () => {
      queryClient.setQueryData(scopedQueryKey(queryKeys.settings.mfa, scopeUrl), {
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
  const features = useFeatures();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['settings', 'mfa'],
    mutationFn: (password: string) =>
      features.disableMfaWithCode
        ? client.settings.mfa.disableMfaWithCode(password)
        : client.settings.mfa.disableMfa('totp', password),
    onSuccess: () => {
      queryClient.setQueryData(scopedQueryKey(queryKeys.settings.mfa, scopeUrl), {
        settings: {
          enabled: false,
          totp: false,
        },
      });
    },
  });
};

export { useMfaConfig, useConfirmMfa, useDisableMfa };
