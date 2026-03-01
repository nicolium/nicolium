import {
  keepPreviousData,
  notifyManager,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { batcher } from '@/api/batcher';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { removePageItem } from '@/utils/queries';

import { queryKeys } from '../keys';

import type { Suggestion } from 'pl-api';

type MinifiedSuggestion = Omit<Suggestion, 'account'> & { account_id: string };

const useSuggestedAccounts = () => {
  const client = useClient();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();
  const queryClient = useQueryClient();

  const getSuggestions = async (): Promise<MinifiedSuggestion[]> => {
    const response = await client.myAccount.getSuggestions();

    const fetcher = batcher.relationships(client).fetch;

    notifyManager.batch(() => {
      for (const { account } of response) {
        fetcher(account.id);
        queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
      }
    });

    return response.map(({ account, ...x }) => ({ ...x, account_id: account.id }));
  };

  const query = useQuery({
    queryKey: queryKeys.suggestions.all,
    queryFn: () => getSuggestions(),
    placeholderData: keepPreviousData,
    enabled: (isLoggedIn && features.suggestions) || features.suggestionsV2,
  });

  return query;
};

const useDismissSuggestion = () => {
  const client = useClient();

  return useMutation({
    mutationFn: (accountId: string) => client.myAccount.dismissSuggestions(accountId),
    onMutate(accountId: string) {
      removePageItem(queryKeys.suggestions.all, accountId, (item, newItem) => item === newItem);
    },
  });
};

export { useSuggestedAccounts, useDismissSuggestion, type MinifiedSuggestion };
