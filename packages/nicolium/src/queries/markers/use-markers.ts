import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const useMarker = (timeline: 'home' | 'notifications') => {
  const client = useClient();
  const { me } = useLoggedIn();

  return useAppQuery({
    queryKey: queryKeys.markers.timeline(timeline),
    queryFn: async () => (await client.timelines.getMarkers([timeline]))[timeline] ?? null,
    enabled: !!me,
  });
};

const useNotificationsMarker = () => useMarker('notifications');

const useHomeTimelineMarker = () => useMarker('home');

const usePrefetchMarker = (timeline: 'home' | 'notifications') => {
  const client = useClient();
  const queryClient = useQueryClient();
  const { me } = useLoggedIn();
  const scopeUrl = useScopeUrl();

  useEffect(() => {
    if (!me) return;
    queryClient.prefetchQuery({
      queryKey: scopedQueryKey(queryKeys.markers.timeline(timeline), scopeUrl),
      queryFn: async () => (await client.timelines.getMarkers([timeline]))[timeline] ?? null,
    });
  }, [me, timeline]);
};

const usePrefetchHomeTimelineMarker = () => usePrefetchMarker('home');
const usePrefetchNotificationsMarker = () => usePrefetchMarker('notifications');

export {
  useNotificationsMarker,
  useHomeTimelineMarker,
  usePrefetchHomeTimelineMarker,
  usePrefetchNotificationsMarker,
};
