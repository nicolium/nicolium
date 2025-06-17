import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

import type { PaginatedResponse, PlApiClient } from 'pl-api';

const makePaginatedResponseQuery = <T1 extends Array<any>, T2, T3 = Array<T2>>(
  queryKey: (...params: T1) => Array<string | undefined>,
  queryFn: (client: PlApiClient, params: T1) => Promise<PaginatedResponse<T2>>,
  select?: (data: InfiniteData<PaginatedResponse<T2>>) => T3,
  enabled?: ((...params: T1) => boolean) | 'isLoggedIn',
) => (...params: T1) => {
    const client = useClient();
    const { isLoggedIn } = useLoggedIn();

    return useInfiniteQuery({
      queryKey: queryKey(...params),
      queryFn: ({ pageParam }) => pageParam.next?.() || queryFn(client, params),
      initialPageParam: { previous: null, next: null, items: [], partial: false } as Awaited<ReturnType<typeof queryFn>>,
      getNextPageParam: (page) => page.next ? page : undefined,
      select: select ?? ((data) => data.pages.map(page => page.items).flat() as T3),
      enabled: enabled === 'isLoggedIn' ? isLoggedIn :  (enabled?.(...params) ?? true),
    });
  };

export { makePaginatedResponseQuery };
