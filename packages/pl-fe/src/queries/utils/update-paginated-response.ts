import { queryClient } from '@/queries/client';

import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import type { PaginatedResponse } from 'pl-api';

const updatePaginatedResponse = <T>(
  queryKey: QueryKey,
  updater: (items: PaginatedResponse<T>['items']) => PaginatedResponse<T>['items'],
) =>
  queryClient.setQueryData<InfiniteData<PaginatedResponse<T>>>(queryKey, (data) => {
    if (!data) return undefined;
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: updater(page.items),
      })),
    };
  });

export { updatePaginatedResponse };
