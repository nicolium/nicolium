import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';

import type { Poll } from 'pl-api';

const usePollQuery = (pollId: string) => {
  const client = useClient();

  return useQuery<Poll>({
    queryKey: ['statuses', 'polls', pollId],
    queryFn: () => client.polls.getPoll(pollId),
  });
};

const usePollVoteMutation = (pollId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['statuses', 'polls', pollId, 'vote'],
    mutationFn: (choices: number[]) => client.polls.vote(pollId, choices),
    onSuccess: (poll) => {
      queryClient.setQueryData<Poll>(['statuses', 'polls', pollId], poll);
    },
  });
};

export { usePollQuery, usePollVoteMutation };
