import {
  keepPreviousData,
  notifyManager,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { batcher } from '@/api/batcher';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';
import { removePageItem } from '@/utils/queries';

import { queryKeys } from '../keys';

import type { Suggestion } from 'pl-api';

type MinifiedSuggestion = Omit<Suggestion, 'account'> & { account_id: string };

const useSuggestedAccounts = () => {
  const client = useClient();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

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
    enabled: (isLoggedIn && features.suggestions) || features.suggestionsV2,
  });

  return query;
};

const useDismissSuggestion = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: (accountId: string) => client.myAccount.dismissSuggestions(accountId),
    onMutate(accountId: string) {
      removePageItem(
        scopedQueryKey(queryKeys.suggestions.all, scopeUrl),
        accountId,
        (item, newItem) => item === newItem,
      );
    },
  });
};

export { useSuggestedAccounts, useDismissSuggestion, type MinifiedSuggestion };
