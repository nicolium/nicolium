import { queryOptions, type UseQueryResult } from '@tanstack/react-query';

import { addCustomToPool } from '@/emoji/search';
import { useClient } from '@/hooks/use-client';
import { useAppQuery } from '@/queries/query';

import { queryClient } from '../client';
import { queryKeys } from '../keys';

import type { CustomEmoji, PlApiClient } from 'pl-api';

const customEmojisQueryOptions = (client: PlApiClient, prefixUrl?: string) =>
  queryOptions({
    queryKey: prefixUrl
      ? [...queryKeys.instance.customEmojis, prefixUrl]
      : queryKeys.instance.customEmojis,
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

  return useAppQuery({
    ...customEmojisQueryOptions(client),
    select,
  });
}

const prefetchCustomEmojis = (client: PlApiClient, prefixUrl: string) =>
  queryClient.prefetchQuery(customEmojisQueryOptions(client, prefixUrl));

export { useCustomEmojis, prefetchCustomEmojis };
