import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';
import { useFrontendConfigActions, useFrontendConfigStore } from '@/stores/frontend-config';
import { useInstanceActions } from '@/stores/instance';

import { queryKeys } from '../keys';

import type { PartialFrontendConfig } from '@/schemas/frontend-config';

const useAdminConfig = () => {
  const client = useClient();
  const features = useFeatures();
  const { data: ownAccount } = useOwnAccount();

  return useAppQuery({
    queryKey: queryKeys.admin.config,
    queryFn: () => client.admin.config.getPleromaConfig(),
    enabled: ownAccount?.is_admin && features.pleromaAdminConfig,
  });
};

const useAdminConfigDescriptions = () => {
  const client = useClient();
  const features = useFeatures();
  const { data: ownAccount } = useOwnAccount();

  return useAppQuery({
    queryKey: queryKeys.admin.configDescriptions,
    queryFn: () => client.admin.config.getPleromaConfigDescriptions(),
    enabled: ownAccount?.is_admin && features.pleromaAdminConfig,
  });
};

const useUpdateAdminConfig = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  const instanceActions = useInstanceActions();
  const frontendConfigActions = useFrontendConfigActions();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: (params: Parameters<typeof client.admin.config.updatePleromaConfig>[0]) =>
      client.admin.config.updatePleromaConfig(params),
    retry: false,
    onSuccess: (data) => {
      instanceActions.importAdminConfigs(data.configs);
      frontendConfigActions.importAdminConfigs(data.configs);
      queryClient.setQueryData(scopedQueryKey(queryKeys.admin.config, scopeUrl), data);
    },
  });
};

const getUpdateFrontendConfigParams = (data: any) => {
  return [
    {
      group: ':pleroma',
      key: ':frontend_configurations',
      value: [
        {
          tuple: [':nicolium', data],
        },
      ],
    },
  ];
};

const useUpdateFrontendConfig = () => {
  const client = useClient();
  const features = useFeatures();
  const queryClient = useQueryClient();
  const instanceActions = useInstanceActions();
  const frontendConfigActions = useFrontendConfigActions();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: async (config: PartialFrontendConfig | undefined) => {
      if (features.pleromaAdminConfig) {
        const data = await client.admin.config.updatePleromaConfig(
          getUpdateFrontendConfigParams(config),
        );
        instanceActions.importAdminConfigs(data.configs);
        frontendConfigActions.importAdminConfigs(data.configs);
        queryClient.setQueryData(scopedQueryKey(queryKeys.admin.config, scopeUrl), data);
      } else {
        frontendConfigActions.rememberConfig(config ?? {});
      }

      return useFrontendConfigStore.getState().config;
    },
    retry: false,
  });
};

export {
  useAdminConfig,
  useAdminConfigDescriptions,
  useUpdateAdminConfig,
  useUpdateFrontendConfig,
  getUpdateFrontendConfigParams,
};
