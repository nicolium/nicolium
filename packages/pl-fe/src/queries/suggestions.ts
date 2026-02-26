import { useMutation, keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

import { batcher } from '@/api/batcher';
import { useClient } from '@/hooks/use-client';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { queryKeys } from '@/queries/keys';

import { removePageItem } from '../utils/queries';

const useSuggestions = () => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const queryClient = useQueryClient();

  const getSuggestions = async () => {
    const response = await client.myAccount.getSuggestions();

    const fetcher = batcher.relationships(client).fetch;

    for (const { account } of response) {
      fetcher(account.id);
      queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
    }

    return response.map(({ account, ...x }) => ({ ...x, account_id: account.id }));
  };

  const query = useQuery({
    queryKey: queryKeys.suggestions.all,
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
      removePageItem(
        queryKeys.suggestions.all,
        accountId,
        (item: any, newItem: any) => item.account_id === newItem,
      );
    },
  });
};

export { useSuggestions, useDismissSuggestion };
