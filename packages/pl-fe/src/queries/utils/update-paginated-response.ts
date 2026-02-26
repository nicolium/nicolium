import { queryClient } from '@/queries/client';

import type { DataTag, InfiniteData, QueryKey } from '@tanstack/react-query';
import type { PaginatedResponse } from 'pl-api';

type InferPaginatedItem<TKey extends QueryKey> =
  TKey extends DataTag<QueryKey, InfiniteData<PaginatedResponse<infer U, any>>> ? U : never;

const updatePaginatedResponse = <
  TKey extends DataTag<QueryKey, InfiniteData<PaginatedResponse<any>>>,
>(
  queryKey: TKey,
  updater: (
    items: PaginatedResponse<InferPaginatedItem<TKey>>['items'],
  ) => PaginatedResponse<InferPaginatedItem<TKey>>['items'],
) =>
  queryClient.setQueryData(queryKey, (data) => {
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
