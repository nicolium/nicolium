import { queryClient } from '../client';

import type { NormalizedStatus } from './normalize';

const findStatuses = (
  predicate: (status: NormalizedStatus) => boolean,
  scopeUrl?: string,
): Array<[string, NormalizedStatus]> =>
  queryClient
    .getQueriesData<NormalizedStatus>({
      predicate: ({ queryKey }) =>
        queryKey.length === 3 &&
        queryKey[1] === 'statuses' &&
        typeof queryKey[2] === 'string' &&
        (!scopeUrl || queryKey[0] === scopeUrl),
    })
    .filter(
      (entry): entry is [readonly [string, 'statuses', string], NormalizedStatus] =>
        entry[1] !== undefined && predicate(entry[1]),
    )
    .map(([key, data]) => [key[2], data]);

export { findStatuses };
