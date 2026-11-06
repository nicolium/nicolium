import { PaginatedResponse } from 'pl-api';

import { queryClient } from '@/queries/client';

import type { DataTag, InfiniteData, QueryKey } from '@tanstack/react-query';

interface Entity {
  id: string;
}

const isEntity = <T = unknown>(object: T): object is T & Entity =>
  object && typeof object === 'object' && 'id' in object;

/** Deduplicate an array of entities by their ID. */
const deduplicateById = <T extends Entity>(entities: T[]): T[] => {
  const map = entities.reduce<Map<string, T>>(
    (result, entity) => result.set(entity.id, entity),
    new Map(),
  );

  return Array.from(map.values());
};

/** Flatten paginated results into a single array. */
const flattenPages = <T>(queryData: InfiniteData<PaginatedResponse<T>> | undefined) => {
  const data = queryData?.pages.reduce<T[]>(
    (prev: T[], curr) => [...prev, ...((curr as any).result ?? (curr as any).items)],
    [],
  );

  if (data && data.every(isEntity)) {
    return deduplicateById(data);
  } else if (data) {
    return data;
  }
};

/** Traverse pages and update the item inside if found. */
const updatePageItem = <T>(
  queryKey: QueryKey,
  newItem: T,
  isItem: (item: T, newItem: T) => boolean,
) => {
  queryClient.setQueriesData<InfiniteData<PaginatedResponse<T>>>({ queryKey }, (data) => {
    if (data) {
      const pages = data.pages.map((page) => {
        const result = page.items.map((item) => (isItem(item, newItem) ? newItem : item));
        return new PaginatedResponse(result, page);
      });
      return { ...data, pages };
    }
  });
};

/** Insert the new item at the beginning of the first page. */
const appendPageItem = <T>(
  queryKey: DataTag<QueryKey, InfiniteData<PaginatedResponse<T>>>,
  newItem: T,
) => {
  queryClient.setQueryData(queryKey, (data) => {
    if (data) {
      const pages = [...data.pages];
      pages[0] = new PaginatedResponse([newItem, ...pages[0].items], pages[0]);
      return { ...data, pages };
    }
  });
};

/** Remove an item inside if found. */
const removePageItem = <T1, T2>(
  queryKey: QueryKey,
  itemToRemove: T2,
  isItem: (item: T1, itemToRemove: T2) => boolean,
  exact = false,
) => {
  const updater = (data: InfiniteData<PaginatedResponse<T1>> | undefined) => {
    if (data) {
      const pages = data.pages.map(
        (page) =>
          new PaginatedResponse(
            page.items.filter((item) => !isItem(item, itemToRemove)),
            page,
          ),
      );
      return { ...data, pages };
    }
  };

  if (exact) queryClient.setQueryData(queryKey, updater);
  else queryClient.setQueriesData({ queryKey }, updater);
};

const paginateQueryData = <T>(array: T[] | undefined) =>
  array?.reduce<T[][]>((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 20);

    resultArray[chunkIndex] ??= [];

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

const sortQueryData = <T>(
  queryKey: DataTag<QueryKey, InfiniteData<PaginatedResponse<T>>>,
  comparator: (a: T, b: T) => number,
) => {
  queryClient.setQueryData(queryKey, (prevResult) => {
    if (prevResult) {
      const nextResult = { ...prevResult };
      const flattenedQueryData = flattenPages(nextResult);
      const sortedQueryData = flattenedQueryData?.toSorted(comparator);
      const paginatedPages = paginateQueryData(sortedQueryData);
      const newPages =
        paginatedPages?.map((page, idx) => new PaginatedResponse(page, prevResult.pages[idx])) ??
        [];

      nextResult.pages = newPages;
      return nextResult;
    }
  });
};

export { flattenPages, updatePageItem, appendPageItem, removePageItem, sortQueryData };
