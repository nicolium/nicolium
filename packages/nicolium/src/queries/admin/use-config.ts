import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useFrontendConfigActions } from '@/stores/frontend-config';
import { useInstanceActions } from '@/stores/instance';

import { queryKeys } from '../keys';

const useAdminConfig = () => {
  const client = useClient();
  const features = useFeatures();
  const { data: ownAccount } = useOwnAccount();

  return useQuery({
    queryKey: queryKeys.admin.config,
    queryFn: () => client.admin.config.getPleromaConfig(),
    enabled: ownAccount?.is_admin && features.pleromaAdminConfig,
  });
};

const useAdminConfigDescriptions = () => {
  const client = useClient();
  const features = useFeatures();
  const { data: ownAccount } = useOwnAccount();

  return useQuery({
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

  return useMutation({
    mutationFn: (params: Parameters<typeof client.admin.config.updatePleromaConfig>[0]) =>
      client.admin.config.updatePleromaConfig(params),
    retry: false,
    onSuccess: (data) => {
      instanceActions.importAdminConfigs(data.configs);
      frontendConfigActions.importAdminConfigs(data.configs);
      queryClient.setQueryData(queryKeys.admin.config, data);
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

export {
  useAdminConfig,
  useAdminConfigDescriptions,
  useUpdateAdminConfig,
  getUpdateFrontendConfigParams,
};
