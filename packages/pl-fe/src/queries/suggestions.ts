import { useMutation, keepPreviousData, useQuery } from '@tanstack/react-query';

import { fetchRelationships } from 'pl-fe/actions/accounts';
import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

import { removePageItem } from '../utils/queries';

const SuggestionKeys = {
  suggestions: ['suggestions'] as const,
};

const useSuggestions = () => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useLoggedIn();

  const getSuggestions = async () => {
    const response = await client.myAccount.getSuggestions();

    const accounts = response.map(({ account }) => account);
    const accountIds = accounts.map((account) => account.id);
    dispatch(importEntities({ accounts }));
    dispatch(fetchRelationships(accountIds));

    return response.map(({ account, ...x }) => ({ ...x, account_id: account.id }));
  };

  return useQuery({
    queryKey: SuggestionKeys.suggestions,
    queryFn: () => getSuggestions(),
    placeholderData: keepPreviousData,
    enabled: isLoggedIn,
  });
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
