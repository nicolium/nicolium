import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const usePollQuery = (pollId: string) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.statuses.polls.show(pollId),
    queryFn: () => client.polls.getPoll(pollId),
    enabled: !!pollId,
  });
};

const usePollVoteMutation = (pollId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['statuses', 'polls', pollId, 'vote'],
    mutationFn: (choices: number[]) => client.polls.vote(pollId, choices),
    onSuccess: (poll) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.statuses.polls.show(pollId), scopeUrl),
        poll,
      );
    },
  });
};

export { usePollQuery, usePollVoteMutation };
