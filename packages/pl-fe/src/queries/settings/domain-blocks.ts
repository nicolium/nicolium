import { getClient } from '@/api';

import { queryClient } from '../client';
import { queryKeys } from '../keys';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { mutationOptions } from '../utils/mutation-options';

import type { MinifiedSuggestion } from '../trends/use-suggested-accounts';
import type { RootState, Store } from '@/store';
import type { Account } from 'pl-api';

let store: Store;
import('@/store').then((value) => (store = value.store)).catch(() => {});

const domainBlocksQueryOptions = makePaginatedResponseQueryOptions(
  queryKeys.settings.domainBlocks,
  (client) => client.filtering.getDomainBlocks(),
)();

const blockDomainMutationOptions = mutationOptions({
  mutationKey: queryKeys.settings.domainBlocks,
  mutationFn: (domain: string) => getClient().filtering.blockDomain(domain),
  onSettled: (_, __, domain) => {
    queryClient.invalidateQueries(domainBlocksQueryOptions);

    const accounts = selectAccountsByDomain(store.getState(), domain);
    if (!accounts) return;

    queryClient.setQueryData<Array<MinifiedSuggestion>>(queryKeys.suggestions.all, (suggestions) =>
      suggestions
        ? suggestions.filter((suggestion) => !accounts.includes(suggestion.account_id))
        : undefined,
    );
  },
});

const unblockDomainMutationOptions = mutationOptions({
  mutationKey: queryKeys.settings.domainBlocks,
  mutationFn: (domain: string) => getClient().filtering.unblockDomain(domain),
  onSettled: () => {
    queryClient.invalidateQueries(domainBlocksQueryOptions);
  },
});

const selectAccountsByDomain = (state: RootState, domain: string): string[] => {
  const accounts = queryClient
    .getQueriesData<Account>({ queryKey: queryKeys.accounts.root })
    .map(([, account]) => account)
    .filter((account): account is Account => !!account && typeof account.id === 'string')
    .filter((account) => account.acct.endsWith(`@${domain}`))
    .map((account) => account.id);
  return accounts ?? [];
};

export { domainBlocksQueryOptions, blockDomainMutationOptions, unblockDomainMutationOptions };
