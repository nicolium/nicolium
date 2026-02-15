import { useQuery } from '@tanstack/react-query';

import { importEntities } from '@/actions/importer';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

import type { Suggestion } from 'pl-api';

type MinifiedSuggestion = Omit<Suggestion, 'account'> & { account_id: string };

const useSuggestedAccounts = () => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  return useQuery({
    queryKey: ['suggestions'],
    queryFn: () =>
      client.myAccount.getSuggestions().then((suggestions) => {
        dispatch(importEntities({ accounts: suggestions.map(({ account }) => account) }));
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
