import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryKeys } from '../keys';
import { scopedQueryKey, useAppQuery } from '../query';

import type { UpdateNotificationPolicyRequest } from 'pl-api';

const useNotificationPolicy = () => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery({
    queryKey: queryKeys.notifications.notificationPolicy,
    queryFn: () => client.notifications.getNotificationPolicy(),
    enabled: features.notificationsPolicy,
  });
};

const useUpdateNotificationPolicy = () => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['notifications', 'notificationPolicy'],
    mutationFn: (policy: UpdateNotificationPolicyRequest) =>
      client.notifications.updateNotificationPolicy(policy),
    onSuccess: (policy) =>
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.notifications.notificationPolicy, scopeUrl),
        policy,
      ),
  });
};

export { useNotificationPolicy, useUpdateNotificationPolicy };
