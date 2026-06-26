import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryClient } from '@/queries/client';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

import type { AdminRelay } from 'pl-api';

const useRelays = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  const getRelays = () => client.admin.relays.getRelays();

  const result = useAppQuery<ReadonlyArray<AdminRelay>>({
    queryKey: queryKeys.admin.relays,
    queryFn: getRelays,
    placeholderData: [],
  });

  const { mutate: followRelay, isPending: isPendingFollow } = useMutation({
    mutationFn: (relayUrl: string) => client.admin.relays.followRelay(relayUrl),
    retry: false,
    onSuccess: (data) => {
      if (!data) {
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.admin.relays, scopeUrl),
        });
      } else {
        queryClient.setQueryData(scopedQueryKey(queryKeys.admin.relays, scopeUrl), (prevResult) =>
          prevResult ? [...prevResult, data] : undefined,
        );
      }
    },
  });

  const { mutate: unfollowRelay, isPending: isPendingUnfollow } = useMutation({
    mutationFn: (id: string) => client.admin.relays.unfollowRelay(id),
    retry: false,
    onSuccess: (_, deletedId) =>
      queryClient.setQueryData(scopedQueryKey(queryKeys.admin.relays, scopeUrl), (prevResult) =>
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
