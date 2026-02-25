import { useMutation, keepPreviousData, useQuery } from '@tanstack/react-query';

import { importEntities } from '@/actions/importer';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';

import { removePageItem } from '../utils/queries';

import { useRelationshipsQuery } from './accounts/use-relationship';

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
    dispatch(importEntities({ accounts }));

    return response.map(({ account, ...x }) => ({ ...x, account_id: account.id }));
  };

  const query = useQuery({
    queryKey: SuggestionKeys.suggestions,
    queryFn: () => getSuggestions(),
    placeholderData: keepPreviousData,
    enabled: isLoggedIn,
  });

  useRelationshipsQuery(query.data?.map((s) => s.account_id));

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
