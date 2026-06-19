import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useAppQuery } from '@/queries/query';

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

  return useMutation({
    mutationKey: ['statuses', 'polls', pollId, 'vote'],
    mutationFn: (choices: number[]) => client.polls.vote(pollId, choices),
    onSuccess: (poll) => {
      queryClient.setQueryData(queryKeys.statuses.polls.show(pollId), poll);
    },
  });
};

export { usePollQuery, usePollVoteMutation };
