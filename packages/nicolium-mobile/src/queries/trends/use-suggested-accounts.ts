import {
  keepPreviousData,
  notifyManager,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { batcher } from '@/api/batcher';
import { useClient, useCurrentAccount, useFeatures } from '@/contexts/current-account-context';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

import type { Suggestion } from 'pl-api';

type MinifiedSuggestion = Omit<Suggestion, 'account'> & { account_id: string };

const useSuggestedAccounts = (enabled?: boolean) => {
  const client = useClient();
  const features = useFeatures();
  const queryClient = useQueryClient();
  const scopeUrl = useCurrentAccount();

  const getSuggestions = async (): Promise<MinifiedSuggestion[]> => {
    const response = await client.myAccount.getSuggestions();

    const fetcher = batcher.relationships(client).fetch;

    notifyManager.batch(() => {
      for (const { account } of response) {
        fetcher(account.id);
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.accounts.show(account.id), scopeUrl),
          account,
        );
      }
    });

    return response.map(({ account, ...x }) => ({ ...x, account_id: account.id }));
  };

  const query = useAppQuery({
    queryKey: queryKeys.suggestions.all,
    queryFn: () => getSuggestions(),
    placeholderData: keepPreviousData,
    enabled: enabled !== false && (features.suggestions || features.suggestionsV2),
  });

  return query;
};

const useDismissSuggestion = () => {
  const client = useClient();
  const scopeUrl = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => client.myAccount.dismissSuggestions(accountId),
    onMutate(accountId: string) {
      queryClient.setQueryData(scopedQueryKey(queryKeys.suggestions.all, scopeUrl), (data) =>
        data?.filter((suggestion) => suggestion.account_id !== accountId),
      );
    },
  });
};

export { useSuggestedAccounts, useDismissSuggestion, type MinifiedSuggestion };
