import { getClient } from '@/api';
import { Entities } from '@/entity-store/entities';

import { queryClient } from '../client';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { mutationOptions } from '../utils/mutation-options';

import type { MinifiedSuggestion } from '../trends/use-suggested-accounts';
import type { EntityStore } from '@/entity-store/types';
import type { RootState, Store } from '@/store';
import type { Account } from 'pl-api';

let store: Store;
import('@/store').then((value) => store = value.store).catch(() => {});

const domainBlocksQueryOptions = makePaginatedResponseQueryOptions(
  ['settings', 'domainBlocks'],
  (client) => client.filtering.getDomainBlocks(),
)();

const blockDomainMutationOptions = mutationOptions({
  mutationKey: ['settings', 'domainBlocks'],
  mutationFn: (domain: string) => getClient().filtering.blockDomain(domain),
  onSettled: (_, __, domain) => {
    queryClient.invalidateQueries(domainBlocksQueryOptions);

    const accounts = selectAccountsByDomain(store.getState(), domain);
    if (!accounts) return;

    queryClient.setQueryData<Array<MinifiedSuggestion>>(['suggestions'], suggestions => suggestions
      ? suggestions.filter((suggestion) => !accounts.includes(suggestion.account_id))
      : undefined);
  },
});

const unblockDomainMutationOptions = mutationOptions({
  mutationKey: ['settings', 'domainBlocks'],
  mutationFn: (domain: string) => getClient().filtering.unblockDomain(domain),
  onSettled: () => {
    queryClient.invalidateQueries(domainBlocksQueryOptions);
  },
});

const selectAccountsByDomain = (state: RootState, domain: string): string[] => {
  const store = state.entities[Entities.ACCOUNTS]?.store as EntityStore<Account> | undefined;
  const entries = store ? Object.entries(store) : undefined;
  const accounts = entries
    ?.filter(([_, item]) => item && item.acct.endsWith(`@${domain}`))
    .map(([_, item]) => item!.id);
  return accounts ?? [];
};

export {
  domainBlocksQueryOptions,
  blockDomainMutationOptions,
  unblockDomainMutationOptions,
};
