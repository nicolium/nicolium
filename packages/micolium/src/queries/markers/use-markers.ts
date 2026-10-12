import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useClient } from '@/contexts/current-account-context';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const useMarker = (timeline: 'home' | 'notifications') => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.markers.timeline(timeline),
    queryFn: async () => (await client.timelines.getMarkers([timeline]))[timeline] ?? null,
  });
};

const useNotificationsMarker = () => useMarker('notifications');

const useHomeTimelineMarker = () => useMarker('home');

const usePrefetchMarker = (timeline: 'home' | 'notifications') => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: scopedQueryKey(queryKeys.markers.timeline(timeline), scopeUrl),
      queryFn: async () => (await client.timelines.getMarkers([timeline]))[timeline] ?? null,
    });
  }, [timeline, client]);
};

const usePrefetchHomeTimelineMarker = () => usePrefetchMarker('home');
const usePrefetchNotificationsMarker = () => usePrefetchMarker('notifications');

export {
  useNotificationsMarker,
  useHomeTimelineMarker,
  usePrefetchHomeTimelineMarker,
  usePrefetchNotificationsMarker,
};
