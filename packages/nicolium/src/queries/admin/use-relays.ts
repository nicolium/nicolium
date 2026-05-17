import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { queryClient } from '@/queries/client';

import { queryKeys } from '../keys';

import type { AdminRelay } from 'pl-api';

const useRelays = () => {
  const client = useClient();

  const getRelays = () => client.admin.relays.getRelays();

  const result = useQuery<ReadonlyArray<AdminRelay>>({
    queryKey: queryKeys.admin.relays,
    queryFn: getRelays,
    placeholderData: [],
  });

  const { mutate: followRelay, isPending: isPendingFollow } = useMutation({
    mutationFn: (relayUrl: string) => client.admin.relays.followRelay(relayUrl),
    retry: false,
    onSuccess: (data) => {
      if (!data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.relays });
      } else {
        queryClient.setQueryData(queryKeys.admin.relays, (prevResult) =>
          prevResult ? [...prevResult, data] : undefined,
        );
      }
    },
  });

  const { mutate: unfollowRelay, isPending: isPendingUnfollow } = useMutation({
    mutationFn: (id: string) => client.admin.relays.unfollowRelay(id),
    retry: false,
    onSuccess: (_, deletedId) =>
      queryClient.setQueryData(queryKeys.admin.relays, (prevResult) =>
        prevResult?.filter(({ id }) => id !== deletedId),
      ),
  });

  return {
    ...result,
    followRelay,
    isPendingFollow,
    unfollowRelay,
    isPendingUnfollow,
  };
};

export { useRelays };
