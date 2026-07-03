import { useMutation, type UseQueryResult } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryClient } from '../client';
import { filterById } from '../utils/filter-id';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyAccountList } from '../utils/minify-list';

import type { Antenna, CreateAntennaParams, PlApiClient, UpdateAntennaParams } from 'pl-api';

function useAntennas<T>(
  select: (data: Array<Antenna>) => T,
  enabled?: boolean,
): UseQueryResult<T, Error>;
function useAntennas(enabled?: boolean): UseQueryResult<Array<Antenna>, Error>;
function useAntennas<T = Array<Antenna>>(
  select?: ((data: Array<Antenna>) => T) | boolean,
  enabled = true,
) {
  const client = useClient();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();
  const selectFn = typeof select === 'function' ? select : undefined;
  const isEnabled = typeof select === 'boolean' ? select : enabled;

  return useAppQuery({
    queryKey: queryKeys.antennas.all,
    queryFn: () => client.antennas.fetchAntennas(),
    enabled: isLoggedIn && features.antennas && isEnabled,
    select: selectFn,
  });
}

const useAntenna = (antennaId?: string) =>
  useAntennas(
    (data) => (antennaId ? data.find((antenna) => antenna.id === antennaId) : undefined),
    antennaId !== undefined,
  );

const useCreateAntenna = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', 'create'],
    mutationFn: (params: CreateAntennaParams) => client.antennas.createAntenna(params),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: scopedQueryKey(queryKeys.antennas.all, scopeUrl) }),
  });
};

const useDeleteAntenna = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', 'delete'],
    mutationFn: (antennaId: string) => client.antennas.deleteAntenna(antennaId),
    onSuccess: (_, deletedAntennaId) => {
      queryClient.setQueryData(scopedQueryKey(queryKeys.antennas.all, scopeUrl), (prevData) =>
        prevData?.filter(({ id }) => id !== deletedAntennaId),
      );
    },
  });
};

const useUpdateAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', 'update', antennaId],
    mutationFn: (params: UpdateAntennaParams) => client.antennas.updateAntenna(antennaId, params),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: scopedQueryKey(queryKeys.antennas.all, scopeUrl) }),
  });
};

const useAntennaAccounts = makePaginatedResponseQuery(
  (antennaId: string) => queryKeys.accountsLists.antennaMembers(antennaId),
  (client, [antennaId], scopeUrl) =>
    client.antennas
      .getAntennaAccounts(antennaId)
      .then((accounts) => minifyAccountList(accounts, scopeUrl)),
);

const useAddAccountsToAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'antennas', antennaId, 'add'],
    mutationFn: (accountIds: Array<string>) =>
      client.antennas.addAntennaAccounts(antennaId, accountIds),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.accountsLists.antennaMembers(antennaId), scopeUrl),
      });
    },
  });
};

const useRemoveAccountsFromAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'antennas', antennaId, 'remove'],
    mutationFn: (accountIds: Array<string>) =>
      client.antennas.removeAntennaAccounts(antennaId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accountsLists.antennaMembers(antennaId), scopeUrl),
        filterById(accountIds),
      );
    },
  });
};

const useAntennaExcludedAccounts = makePaginatedResponseQuery(
  (antennaId: string) => queryKeys.accountsLists.antennaExcludedAccounts(antennaId),
  (client, [antennaId], scopeUrl) =>
    client.antennas
      .getAntennaExcludedAccounts(antennaId)
      .then((accounts) => minifyAccountList(accounts, scopeUrl)),
);

const useAddExcludedAccountsToAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'antennas', antennaId, 'addExcluded'],
    mutationFn: (accountIds: Array<string>) =>
      client.antennas.addAntennaExcludedAccounts(antennaId, accountIds),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(
          queryKeys.accountsLists.antennaExcludedAccounts(antennaId),
          scopeUrl,
        ),
      });
    },
  });
};

const useRemoveExcludedAccountsFromAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['accountsLists', 'antennas', antennaId, 'removeExcluded'],
    mutationFn: (accountIds: Array<string>) =>
      client.antennas.removeAntennaExcludedAccounts(antennaId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.accountsLists.antennaExcludedAccounts(antennaId), scopeUrl),
        filterById(accountIds),
      );
    },
  });
};

const useAntennaDomains = (antennaId: string) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.antennas.domains(antennaId),
    queryFn: () => client.antennas.getAntennaDomains(antennaId),
  });
};

const makeAntennaItemsMutation =
  <T>(
    kind: 'domains' | 'keywords' | 'tags',
    action: 'add' | 'remove' | 'addExcluded' | 'removeExcluded',
    mutationFn: (client: PlApiClient, antennaId: string, items: Array<string>) => Promise<T>,
  ) =>
  (antennaId: string) => {
    const client = useClient();
    const scopeUrl = useScopeUrl();

    return useMutation({
      mutationKey: ['antennas', antennaId, kind, action],
      mutationFn: (items: Array<string>) => mutationFn(client, antennaId, items),
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.antennas[kind](antennaId), scopeUrl),
        }),
    });
  };

const useAddDomainsToAntenna = makeAntennaItemsMutation('domains', 'add', (client, id, domains) =>
  client.antennas.addAntennaDomains(id, domains),
);

const useRemoveDomainsFromAntenna = makeAntennaItemsMutation(
  'domains',
  'remove',
  (client, id, domains) => client.antennas.removeAntennaDomains(id, domains),
);

const useAddExcludedDomainsToAntenna = makeAntennaItemsMutation(
  'domains',
  'addExcluded',
  (client, id, domains) => client.antennas.addAntennaExcludedDomains(id, domains),
);

const useRemoveExcludedDomainsFromAntenna = makeAntennaItemsMutation(
  'domains',
  'removeExcluded',
  (client, id, domains) => client.antennas.removeAntennaExcludedDomains(id, domains),
);

const useAntennaKeywords = (antennaId: string) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.antennas.keywords(antennaId),
    queryFn: () => client.antennas.getAntennaKeywords(antennaId),
  });
};

const useAddKeywordsToAntenna = makeAntennaItemsMutation(
  'keywords',
  'add',
  (client, id, keywords) => client.antennas.addAntennaKeywords(id, keywords),
);

const useRemoveKeywordsFromAntenna = makeAntennaItemsMutation(
  'keywords',
  'remove',
  (client, id, keywords) => client.antennas.removeAntennaKeywords(id, keywords),
);

const useAddExcludedKeywordsToAntenna = makeAntennaItemsMutation(
  'keywords',
  'addExcluded',
  (client, id, keywords) => client.antennas.addAntennaExcludedKeywords(id, keywords),
);

const useRemoveExcludedKeywordsFromAntenna = makeAntennaItemsMutation(
  'keywords',
  'removeExcluded',
  (client, id, keywords) => client.antennas.removeAntennaExcludedKeywords(id, keywords),
);

const useAntennaTags = (antennaId: string) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.antennas.tags(antennaId),
    queryFn: () => client.antennas.getAntennaTags(antennaId),
  });
};

const useAddTagsToAntenna = makeAntennaItemsMutation('tags', 'add', (client, id, tags) =>
  client.antennas.addAntennaTags(id, tags),
);

const useRemoveTagsFromAntenna = makeAntennaItemsMutation('tags', 'remove', (client, id, tags) =>
  client.antennas.removeAntennaTags(id, tags),
);

const useAddExcludedTagsToAntenna = makeAntennaItemsMutation(
  'tags',
  'addExcluded',
  (client, id, tags) => client.antennas.addAntennaExcludedTags(id, tags),
);

const useRemoveExcludedTagsFromAntenna = makeAntennaItemsMutation(
  'tags',
  'removeExcluded',
  (client, id, tags) => client.antennas.removeAntennaExcludedTags(id, tags),
);

export {
  useAntennas,
  useAntenna,
  useCreateAntenna,
  useDeleteAntenna,
  useUpdateAntenna,
  useAntennaAccounts,
  useAddAccountsToAntenna,
  useRemoveAccountsFromAntenna,
  useAntennaExcludedAccounts,
  useAddExcludedAccountsToAntenna,
  useRemoveExcludedAccountsFromAntenna,
  useAntennaDomains,
  useAddDomainsToAntenna,
  useRemoveDomainsFromAntenna,
  useAddExcludedDomainsToAntenna,
  useRemoveExcludedDomainsFromAntenna,
  useAntennaKeywords,
  useAddKeywordsToAntenna,
  useRemoveKeywordsFromAntenna,
  useAddExcludedKeywordsToAntenna,
  useRemoveExcludedKeywordsFromAntenna,
  useAntennaTags,
  useAddTagsToAntenna,
  useRemoveTagsFromAntenna,
  useAddExcludedTagsToAntenna,
  useRemoveExcludedTagsFromAntenna,
};
