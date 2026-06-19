import { useClient } from '@/hooks/use-client';
import { useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const useSearchLocation = (query: string) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.search.location(query),
    queryFn: ({ signal }) => client.search.searchLocation(query, { signal }),
    gcTime: 60 * 1000,
    enabled: !!query.trim(),
  });
};

export { useSearchLocation };
