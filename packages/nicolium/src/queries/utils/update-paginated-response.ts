import { PaginatedResponse } from 'pl-api';

import { queryClient } from '@/queries/client';

import type { DataTag, InfiniteData, QueryKey } from '@tanstack/react-query';

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
      pages: data.pages.map((page) => new PaginatedResponse(updater(page.items), page)),
    };
  });

export { updatePaginatedResponse };
