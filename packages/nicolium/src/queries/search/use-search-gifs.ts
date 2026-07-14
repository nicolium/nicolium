import { useClient } from '@/hooks/use-client';
import { useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const useSearchGifs = (query: string) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.search.gifs(query),
    queryFn: ({ signal }) => client.gifs.searchGifs(query, { signal }),
    gcTime: 60 * 1000,
    enabled: !!query.trim(),
    placeholderData: (previousData) => previousData,
  });
};

export { useSearchGifs };
