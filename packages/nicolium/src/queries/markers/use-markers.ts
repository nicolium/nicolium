import { useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';

import { queryKeys } from '../keys';

const useNotificationsMarker = () => {
  const client = useClient();
  const { me } = useLoggedIn();

  return useQuery({
    queryKey: queryKeys.markers.notifications,
    queryFn: async () =>
      (await client.timelines.getMarkers(['notifications'])).notifications ?? null,
    enabled: !!me,
  });
};

export { useNotificationsMarker };
