import { useClient } from '@/hooks/use-client';
import { useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

import type {
  AdminDimensionKey,
  AdminGetDimensionsParams,
  AdminGetMeasuresParams,
  AdminMeasureKey,
} from 'pl-api';

const useDimensions = (keys: AdminDimensionKey[], params?: AdminGetDimensionsParams) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.admin.dimensions(keys, params),
    queryFn: () => client.admin.dimensions.getDimensions(keys, params),
    enabled: client.features.mastodonAdminMetrics,
  });
};

const useMeasures = (
  keys: AdminMeasureKey[],
  startAt: string,
  endAt: string,
  params?: AdminGetMeasuresParams,
) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.admin.measures(keys, startAt, endAt, params),
    queryFn: () => client.admin.measures.getMeasures(keys, startAt, endAt, params),
    enabled: client.features.mastodonAdminMetrics,
  });
};

const useRetention = (startAt: string, endAt: string, frequency: 'day' | 'month') => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.admin.retention(startAt, endAt, frequency),
    queryFn: () => client.admin.retention.getRetention(startAt, endAt, frequency),
    enabled: client.features.mastodonAdminMetrics,
  });
};

export { useDimensions, useMeasures, useRetention };
