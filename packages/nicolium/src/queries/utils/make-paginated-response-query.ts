import {
  type DataTag,
  type InfiniteData,
  type QueryKey,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useOwnAccount } from '@/hooks/use-own-account';

import type { PaginatedResponse, PlApiClient } from 'pl-api';

class PaginatedResponseArray<T> extends Array<T> {
  declare total: number | undefined;
  declare partial: boolean | undefined;

  static override from<T>(items: ArrayLike<T> | Iterable<T>): PaginatedResponseArray<T> {
    const arr = new PaginatedResponseArray<T>();
    for (const item of Array.from(items)) {
      arr.push(item);
    }
    return arr;
  }

  /** Set metadata as non-enumerable to preserve TanStack Query structural sharing. */
  setMeta(total: number | undefined, partial: boolean | undefined): this {
    Object.defineProperty(this, 'total', { value: total, writable: true, enumerable: false, configurable: true });
    Object.defineProperty(this, 'partial', { value: partial, writable: true, enumerable: false, configurable: true });
    return this;
  }
}

type PaginatedResponseQueryResult<T, IsArray extends boolean> = IsArray extends true
  ? PaginatedResponseArray<T>
  : T extends Array<infer TItem>
    ? PaginatedResponseArray<TItem>
    : T;

const makePaginatedResponseQuery =
  <
    T1 extends Array<any>,
    T2,
    IsArray extends boolean = true,
    T3 = PaginatedResponseQueryResult<T2, IsArray>,
  >(
    queryKey:
      | DataTag<QueryKey, InfiniteData<PaginatedResponse<T2, IsArray>>>
      | ((...params: T1) => DataTag<QueryKey, InfiniteData<PaginatedResponse<T2, IsArray>>>),
    queryFn: (client: PlApiClient, params: T1) => Promise<PaginatedResponse<T2, IsArray>>,
    select?: (data: InfiniteData<PaginatedResponse<T2, IsArray>>) => T3,
    enabled?: ((...params: T1) => boolean) | 'isLoggedIn' | 'isAdmin',
  ) =>
  (...params: T1) => {
    const client = useClient();
    const { data: account } = useOwnAccount();

    return useInfiniteQuery({
      queryKey: typeof queryKey === 'object' ? queryKey : queryKey(...params),
      queryFn: ({ pageParam }) => pageParam.next?.() ?? queryFn(client, params),
      initialPageParam: {
        previous: null,
        next: null,
        items: [] as unknown as PaginatedResponse<T2, IsArray>['items'],
        partial: false,
      } as Awaited<ReturnType<typeof queryFn>>,
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
              data.pages.flatMap((page) =>
                Array.isArray(page.items) ? page.items : [page.items],
              ),
            ).setMeta(lastPage.total, lastPage.partial);

            return items as T3;
          }

          return lastPage.items as T3;
        }),
      enabled:
        enabled === 'isLoggedIn'
          ? !!account
          : enabled === 'isAdmin'
            ? !!(account?.is_admin ?? account?.is_moderator)
            : (enabled?.(...params) ?? true),
    });
  };

export { makePaginatedResponseQuery, PaginatedResponseArray, type PaginatedResponseQueryResult };
