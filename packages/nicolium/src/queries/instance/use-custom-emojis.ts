import { queryOptions, useQuery, type UseQueryResult } from '@tanstack/react-query';

import { addCustomToPool } from '@/features/emoji/search';
import { useClient } from '@/hooks/use-client';

import { queryClient } from '../client';
import { queryKeys } from '../keys';

import type { CustomEmoji, PlApiClient } from 'pl-api';

const customEmojisQueryOptions = (client: PlApiClient) =>
  queryOptions({
    queryKey: queryKeys.instance.customEmojis,
    queryFn: () =>
      client.instance.getCustomEmojis().then((emojis) => {
        addCustomToPool(emojis);
        return emojis;
      }),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

function useCustomEmojis<T>(select: (data: Array<CustomEmoji>) => T): UseQueryResult<T, Error>;
function useCustomEmojis(): UseQueryResult<Array<CustomEmoji>, Error>;
function useCustomEmojis<T = Array<CustomEmoji>>(select?: (data: Array<CustomEmoji>) => T) {
  const client = useClient();

  return useQuery({
    ...customEmojisQueryOptions(client),
    select,
  });
}

const prefetchCustomEmojis = (client: PlApiClient) =>
  queryClient.prefetchQuery(customEmojisQueryOptions(client));

export { useCustomEmojis, prefetchCustomEmojis };
