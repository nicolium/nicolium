import { useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';

import { queryKeys } from '../keys';

const useSearchLocation = (query: string) => {
  const client = useClient();

  return useQuery({
    queryKey: queryKeys.search.location(query),
    queryFn: ({ signal }) => client.search.searchLocation(query, { signal }),
    gcTime: 60 * 1000,
    enabled: !!query.trim(),
  });
};

export { useSearchLocation };
