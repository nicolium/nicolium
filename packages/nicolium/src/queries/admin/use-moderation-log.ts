import { useInfiniteQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { flattenPages } from '@/utils/queries';

import { queryKeys } from '../keys';

import type { PaginatedResponse } from 'pl-api';
import type { AdminModerationLogEntry } from 'pl-api';

const useModerationLog = () => {
  const client = useClient();

  const getModerationLog = (
    pageParam?: Pick<PaginatedResponse<AdminModerationLogEntry>, 'next'>,
  ): Promise<PaginatedResponse<AdminModerationLogEntry>> =>
    (pageParam?.next ?? client.admin.moderationLog.getModerationLog)();

  const queryInfo = useInfiniteQuery({
    queryKey: queryKeys.admin.moderationLog,
    queryFn: ({ pageParam }) => getModerationLog(pageParam),
    initialPageParam: {
      next: null as (() => Promise<PaginatedResponse<AdminModerationLogEntry>>) | null,
    },
    getNextPageParam: (config) => (config.next ? config : undefined),
  });

  const data = flattenPages(queryInfo.data) ?? [];

  return {
    ...queryInfo,
    data,
  };
};

export { useModerationLog };
