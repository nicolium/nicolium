import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ADMIN_CONFIG_UPDATE_SUCCESS, type AdminActions } from '@/actions/admin';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';

import { queryKeys } from '../keys';

const useAdminConfig = () => {
  const client = useClient();
  const features = useFeatures();
  const { data: ownAccount } = useOwnAccount();

  return useQuery({
    queryKey: queryKeys.admin.config,
    queryFn: () => client.admin.config.getPleromaConfig(),
    enabled: ownAccount?.is_admin && features.pleromaAdminAccounts,
  });
};

const useUpdateAdminConfig = () => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Parameters<typeof client.admin.config.updatePleromaConfig>[0]) =>
      client.admin.config.updatePleromaConfig(params),
    retry: false,
    onSuccess: (data) => {
      dispatch<AdminActions>({
        type: ADMIN_CONFIG_UPDATE_SUCCESS,
        configs: data.configs,
        needsReboot: data.need_reboot,
      });
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

export { useAdminConfig, useUpdateAdminConfig, getUpdateFrontendConfigParams };
