import { useCurrentAccountContext } from '@/contexts/current-account-context';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { backendUrl } from '@/stores/auth';

import { useAppInfiniteQuery } from '../query';

import type {
  DataTag,
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import type { Features, PaginatedResponse, PlApiClient } from 'pl-api';

class PaginatedResponseArray<T> extends Array<T> {
  total: number | undefined;
  partial: boolean | undefined;

  static override from<T>(items: ArrayLike<T> | Iterable<T>): PaginatedResponseArray<T> {
    const arr = new PaginatedResponseArray<T>();
    for (const item of Array.from(items)) {
      arr.push(item);
    }
    return arr;
  }

  setMeta(total: number | undefined, partial: boolean | undefined): this {
    this.total = total;
    this.partial = partial;
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
    queryFn: (
      client: PlApiClient,
      params: T1,
      accountOrInstanceUrl: string,
    ) => Promise<PaginatedResponse<T2, IsArray>>,
    select?: (data: InfiniteData<PaginatedResponse<T2, IsArray>>) => T3,
    enabled?: ((...params: T1) => boolean) | 'isLoggedIn' | 'isAdmin',
    options?: Omit<
      UseInfiniteQueryOptions<PaginatedResponse<T2, IsArray>>,
      'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'select' | 'enabled'
    >,
    feature?: Exclude<keyof Features, 'version'>,
  ) =>
  (...params: T1) => {
    const client = useClient();
    const features = useFeatures();
    const { data: account } = useOwnAccount();
    const accountOrInstanceUrl = useCurrentAccountContext().meUrl || backendUrl;

    type PageParam = { next: (() => Promise<PaginatedResponse<T2, IsArray>>) | null };

    return useAppInfiniteQuery({
      queryKey: typeof queryKey === 'object' ? queryKey : queryKey(...params),
      queryFn: ({ pageParam }) =>
        (pageParam as PageParam).next?.() ?? queryFn(client, params, accountOrInstanceUrl),
      initialPageParam: { next: null } as PageParam,
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
      enabled:
        (enabled === 'isLoggedIn'
          ? !!account
          : enabled === 'isAdmin'
            ? !!(account?.is_admin ?? account?.is_moderator)
            : (enabled?.(...params) ?? true)) &&
        (!feature || features[feature]),
      ...options,
    });
  };

export { makePaginatedResponseQuery, PaginatedResponseArray, type PaginatedResponseQueryResult };
