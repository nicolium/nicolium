import { useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { queryKeys } from '@/queries/keys';
import { useAppQuery } from '@/queries/query';

import { useAccount } from './use-account';

import type { NicoliumResponse } from '@/api';

const getResponseStatus = (error: unknown) =>
  (error as { response?: NicoliumResponse })?.response?.status;

const useAccountLookup = (acct: string | undefined, withRelationship = false) => {
  const client = useClient();
  const features = useFeatures();
  const queryClient = useQueryClient();

  const accountIdQuery = useAppQuery({
    queryKey: queryKeys.accounts.lookup(acct?.toLowerCase()!),
    queryFn: async ({ signal }) => {
      let account;

      if (features.accountLookup) {
        account = await client.accounts.lookupAccount(acct!, { signal });
      } else if (features.accountByUsername) {
        account = await client.accounts.getAccount(acct!);
      } else {
        const results = await client.accounts.searchAccounts(
          acct!,
          { resolve: true, limit: 1 },
          { signal },
        );
        account = results.find((result) => result.acct.toLowerCase() === acct!.toLowerCase());
      }

      if (account) {
        queryClient.setQueryData(queryKeys.accounts.show(account.id), account);
        return account.id;
      }
    },
    enabled: !!acct,
  });

  const accountQuery = useAccount(accountIdQuery.data, withRelationship);
  const lookupIsUnauthorized = getResponseStatus(accountIdQuery.error) === 401;

  return {
    ...accountQuery,
    error: accountIdQuery.error ?? accountQuery.error,
    isError: accountIdQuery.isError || accountQuery.isError,
    isLoading: accountIdQuery.isLoading || accountQuery.isLoading,
    isFetching: accountIdQuery.isFetching || accountQuery.isFetching,
    isPending: accountIdQuery.isPending || accountQuery.isPending,
    isUnauthorized: lookupIsUnauthorized || accountQuery.isUnauthorized,
  };
};

export { useAccountLookup };
