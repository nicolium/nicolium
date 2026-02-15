import { type InfiniteData, infiniteQueryOptions, type QueryKey } from '@tanstack/react-query';

import { store } from '@/store';

import { PaginatedResponseArray } from './make-paginated-response-query';

import type { PaginatedResponse, PlApiClient } from 'pl-api';

const makePaginatedResponseQueryOptions =
  <T1 extends Array<any>, T2, T3 = PaginatedResponseArray<T2>>(
    queryKey: QueryKey | ((...params: T1) => QueryKey),
    queryFn: (client: PlApiClient, params: T1) => Promise<PaginatedResponse<T2>>,
    select?: (data: InfiniteData<PaginatedResponse<T2>>) => T3,
  ) =>
  (...params: T1) =>
    infiniteQueryOptions({
      queryKey: typeof queryKey === 'object' ? queryKey : queryKey(...params),
      queryFn: ({ pageParam }) =>
        pageParam.next?.() ?? queryFn(store.getState().auth.client, params),
      initialPageParam: { previous: null, next: null, items: [], partial: false } as Awaited<
        ReturnType<typeof queryFn>
      >,
      getNextPageParam: (page) => (page.next ? page : undefined),
      select:
        select ??
        ((data) => {
          const items = new PaginatedResponseArray(...data.pages.map((page) => page.items).flat());

          const lastPage = data.pages.at(-1);
          if (lastPage) {
            items.total = lastPage.total;
            items.partial = lastPage.partial;
          }

          return items as T3;
        }),
    });

export { makePaginatedResponseQueryOptions };
