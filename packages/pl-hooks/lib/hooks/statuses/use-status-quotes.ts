import { useInfiniteQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from '@/contexts/api-client';
import { usePlHooksQueryClient } from '@/contexts/query-client';
import { minifyStatusList } from '@/normalizers/status-list';

import type { PaginatedResponse } from 'pl-api';

const useStatusQuotes = (statusId: string) => {
  const queryClient = usePlHooksQueryClient();
  const { client } = usePlHooksApiClient();

  return useInfiniteQuery(
    {
      queryKey: ['statusLists', 'quotes', statusId],
      queryFn: ({ pageParam }) =>
        pageParam.next?.() || client.statuses.getStatusQuotes(statusId).then(minifyStatusList),
      initialPageParam: { next: null as (() => Promise<PaginatedResponse<string>>) | null },
      getNextPageParam: (page) => (page.next ? page : undefined),
      select: (data) => data.pages.map((page) => page.items).flat(),
    },
    queryClient,
  );
};

export { useStatusQuotes };
