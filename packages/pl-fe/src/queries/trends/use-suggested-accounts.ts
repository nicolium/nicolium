import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

import { queryKeys } from '../keys';

import type { Suggestion } from 'pl-api';

type MinifiedSuggestion = Omit<Suggestion, 'account'> & { account_id: string };

const useSuggestedAccounts = () => {
  const client = useClient();
  const features = useFeatures();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.suggestions.all,
    queryFn: () =>
      client.myAccount.getSuggestions().then((suggestions) => {
        for (const { account } of suggestions) {
          queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
        }
        return suggestions.map(
          ({ account, ...suggestion }): MinifiedSuggestion => ({
            account_id: account.id,
            ...suggestion,
          }),
        );
      }),
    enabled: features.suggestions || features.suggestionsV2,
  });
};

export { useSuggestedAccounts, type MinifiedSuggestion };
