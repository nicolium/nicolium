import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryClient } from '../client';
import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

import type { Account } from 'pl-api';

const useDomainBlocksQuery = makePaginatedResponseQuery(queryKeys.settings.domainBlocks, (client) =>
  client.filtering.getDomainBlocks(),
);

const useBlockDomainMutation = () => {
  const queryClient = useQueryClient();
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.settings.domainBlocks,
    mutationFn: (domain: string) => client.filtering.blockDomain(domain),
    onSettled: (_, __, domain) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.domainBlocks });

      const accounts = selectAccountsByDomain(domain);
      if (!accounts) return;

      queryClient.setQueryData(scopedQueryKey(queryKeys.suggestions.all, scopeUrl), (suggestions) =>
        suggestions
          ? suggestions.filter((suggestion) => !accounts.includes(suggestion.account_id))
          : undefined,
      );
    },
  });
};

const useUnblockDomainMutation = () => {
  const queryClient = useQueryClient();
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: queryKeys.settings.domainBlocks,
    mutationFn: (domain: string) => client.filtering.unblockDomain(domain),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.settings.domainBlocks, scopeUrl),
      });
    },
  });
};

const selectAccountsByDomain = (domain: string): string[] => {
  const accounts = queryClient
    .getQueriesData<Account>({ queryKey: queryKeys.accounts.root })
    .map(([, account]) => account)
    .filter((account): account is Account => !!account && typeof account.id === 'string')
    .filter((account) => account.acct.endsWith(`@${domain}`))
    .map((account) => account.id);
  return accounts ?? [];
};

export { useDomainBlocksQuery, useBlockDomainMutation, useUnblockDomainMutation };
