import { type InfiniteData, infiniteQueryOptions, type QueryKey } from '@tanstack/react-query';

import { defaultSelect, type PaginatedResponseQueryResult } from './make-paginated-response-query';

import type { TaggedKey } from '../keys';
import type { PaginatedResponse, PlApiClient } from 'pl-api';

const makePaginatedResponseQueryOptions =
  <
    T1 extends Array<any>,
    T2,
    IsArray extends boolean = true,
    T3 = PaginatedResponseQueryResult<T2, IsArray>,
  >(
    queryKey:
      | TaggedKey<QueryKey, InfiniteData<PaginatedResponse<T2, IsArray>>>
      | ((...params: T1) => TaggedKey<QueryKey, InfiniteData<PaginatedResponse<T2, IsArray>>>),
    queryFn: (
      client: PlApiClient,
      params: T1,
      scopeUrl: string,
    ) => Promise<PaginatedResponse<T2, IsArray>>,
    select?: (data: InfiniteData<PaginatedResponse<T2, IsArray>>) => T3,
  ) =>
  (client: PlApiClient, ...params: [...T1, scopeUrl: string]) =>
    infiniteQueryOptions({
      queryKey: typeof queryKey === 'object' ? queryKey : queryKey(...(params.slice(0, -1) as T1)),
      queryFn: ({ pageParam }) =>
        pageParam.next?.() ?? queryFn(client, params.slice(0, -1) as T1, params.at(-1) as string),
      initialPageParam: { next: null as (() => Promise<PaginatedResponse<T2, IsArray>>) | null },
      getNextPageParam: (page) => (page.next ? page : undefined),
      select: select ?? defaultSelect<T2, IsArray, T3>,
    });

export { makePaginatedResponseQueryOptions };
