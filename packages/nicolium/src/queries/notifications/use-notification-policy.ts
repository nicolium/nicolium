import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

import { queryKeys } from '../keys';
import { useAppQuery } from '../query';

const useNotificationPolicy = () => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery({
    queryKey: queryKeys.notifications.notificationPolicy,
    queryFn: () => client.notifications.getNotificationPolicy(),
    enabled: features.notificationsPolicy,
  });
};

export { useNotificationPolicy };
