import { type InfiniteData, type QueryKey, useInfiniteQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useOwnAccount } from '@/hooks/use-own-account';

import type { PaginatedResponse, PlApiClient } from 'pl-api';

class PaginatedResponseArray<T> extends Array<T> {
  total?: number;
  partial?: boolean;
}

const makePaginatedResponseQuery =
  <T1 extends Array<any>, T2, T3 = PaginatedResponseArray<T2>>(
    queryKey: QueryKey | ((...params: T1) => QueryKey),
    queryFn: (client: PlApiClient, params: T1) => Promise<PaginatedResponse<T2>>,
    select?: (data: InfiniteData<PaginatedResponse<T2>>) => T3,
    enabled?: ((...params: T1) => boolean) | 'isLoggedIn' | 'isAdmin',
  ) =>
  (...params: T1) => {
    const client = useClient();
    const { account } = useOwnAccount();

    return useInfiniteQuery({
      queryKey: typeof queryKey === 'object' ? queryKey : queryKey(...params),
      queryFn: ({ pageParam }) => pageParam.next?.() ?? queryFn(client, params),
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
      enabled:
        enabled === 'isLoggedIn'
          ? !!account
          : enabled === 'isAdmin'
            ? !!(account?.is_admin ?? account?.is_moderator)
            : (enabled?.(...params) ?? true),
    });
  };

export { makePaginatedResponseQuery, PaginatedResponseArray };
