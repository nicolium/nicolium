import {
  type DataTag,
  type InfiniteData,
  infiniteQueryOptions,
  type QueryKey,
} from '@tanstack/react-query';

import {
  PaginatedResponseArray,
  type PaginatedResponseQueryResult,
} from './make-paginated-response-query';

import type { PaginatedResponse, PlApiClient } from 'pl-api';

const makePaginatedResponseQueryOptions =
  <
    T1 extends Array<any>,
    T2,
    IsArray extends boolean = true,
    T3 = PaginatedResponseQueryResult<T2, IsArray>,
  >(
    queryKey:
      | DataTag<QueryKey, InfiniteData<PaginatedResponse<T2, IsArray>>>
      | ((...params: T1) => DataTag<QueryKey, InfiniteData<PaginatedResponse<T2, IsArray>>>),
    queryFn: (
      client: PlApiClient,
      params: T1,
      accountOrInstanceUrl: string,
    ) => Promise<PaginatedResponse<T2, IsArray>>,
    select?: (data: InfiniteData<PaginatedResponse<T2, IsArray>>) => T3,
  ) =>
  (client: PlApiClient, ...params: [...T1, accountOrInstanceUrl: string]) =>
    infiniteQueryOptions({
      queryKey: typeof queryKey === 'object' ? queryKey : queryKey(...(params.slice(0, -1) as T1)),
      queryFn: ({ pageParam }) =>
        pageParam.next?.() ?? queryFn(client, params.slice(0, -1) as T1, params.at(-1) as string),
      initialPageParam: { next: null as (() => Promise<PaginatedResponse<T2, IsArray>>) | null },
      getNextPageParam: (page) => (page.next ? page : undefined),
      select:
        select ??
        ((data) => {
          const lastPage = data.pages.at(-1);

          if (!lastPage) {
            return new PaginatedResponseArray() as T3;
          }

          if (Array.isArray(lastPage.items)) {
            const items = PaginatedResponseArray.from(
              data.pages.flatMap((page) => (Array.isArray(page.items) ? page.items : [page.items])),
            ).setMeta(lastPage.total, lastPage.partial);

            return items as T3;
          }

          return lastPage.items as T3;
        }),
    });

export { makePaginatedResponseQueryOptions };
