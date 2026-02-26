import { useMutation, keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

import { batcher } from '@/api/batcher';
import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';

import { removePageItem } from '../utils/queries';

const SuggestionKeys = {
  suggestions: ['suggestions'] as const,
};

const useSuggestions = () => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const queryClient = useQueryClient();

  const getSuggestions = async () => {
    const response = await client.myAccount.getSuggestions();

    const fetcher = batcher.relationships(client).fetch;

    for (const { account } of response) {
      fetcher(account.id);
      queryClient.setQueryData(['accounts', account.id], account);
    }

    return response.map(({ account, ...x }) => ({ ...x, account_id: account.id }));
  };

  const query = useQuery({
    queryKey: SuggestionKeys.suggestions,
    queryFn: () => getSuggestions(),
    placeholderData: keepPreviousData,
    enabled: isLoggedIn,
  });

  return query;
};

const useDismissSuggestion = () => {
  const client = useClient();

  return useMutation({
    mutationFn: (accountId: string) => client.myAccount.dismissSuggestions(accountId),
    onMutate(accountId: string) {
      removePageItem(SuggestionKeys.suggestions, accountId, (o: any, n: any) => o.account === n);
    },
  });
};

export { useSuggestions, useDismissSuggestion };
