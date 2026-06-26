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

import type { Antenna, CreateAntennaParams, UpdateAntennaParams } from 'pl-api';

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

  return useMutation({
    mutationKey: ['antennas', 'create'],
    mutationFn: (params: CreateAntennaParams) => client.antennas.createAntenna(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.antennas.all }),
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
  (client, [antennaId]) => client.antennas.getAntennaAccounts(antennaId).then(minifyAccountList),
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

  return useMutation({
    mutationKey: ['accountsLists', 'antennas', antennaId, 'remove'],
    mutationFn: (accountIds: Array<string>) =>
      client.antennas.removeAntennaAccounts(antennaId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.setQueryData(
        queryKeys.accountsLists.antennaMembers(antennaId),
        filterById(accountIds),
      );
    },
  });
};

const useAntennaExcludedAccounts = makePaginatedResponseQuery(
  (antennaId: string) => queryKeys.accountsLists.antennaExcludedAccounts(antennaId),
  (client, [antennaId]) =>
    client.antennas.getAntennaExcludedAccounts(antennaId).then(minifyAccountList),
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
        queryKey: scopedQueryKey(queryKeys.accountsLists.antennaMembers(antennaId), scopeUrl),
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

const useAddDomainsToAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'domains', 'add'],
    mutationFn: (domains: Array<string>) => client.antennas.addAntennaDomains(antennaId, domains),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.antennas.domains(antennaId), scopeUrl),
      }),
  });
};

const useRemoveDomainsFromAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'domains', 'remove'],
    mutationFn: (domains: Array<string>) =>
      client.antennas.removeAntennaDomains(antennaId, domains),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.antennas.domains(antennaId), scopeUrl),
      }),
  });
};

const useAddExcludedDomainsToAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'domains', 'addExcluded'],
    mutationFn: (domains: Array<string>) =>
      client.antennas.addAntennaExcludedDomains(antennaId, domains),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.antennas.domains(antennaId), scopeUrl),
      }),
  });
};

const useRemoveExcludedDomainsFromAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'domains', 'removeExcluded'],
    mutationFn: (domains: Array<string>) =>
      client.antennas.removeAntennaExcludedDomains(antennaId, domains),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.antennas.domains(antennaId), scopeUrl),
      }),
  });
};

const useAntennaKeywords = (antennaId: string) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.antennas.keywords(antennaId),
    queryFn: () => client.antennas.getAntennaKeywords(antennaId),
  });
};

const useAddKeywordsToAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'keywords', 'add'],
    mutationFn: (keywords: Array<string>) =>
      client.antennas.addAntennaKeywords(antennaId, keywords),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.antennas.keywords(antennaId), scopeUrl),
      }),
  });
};

const useRemoveKeywordsFromAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'keywords', 'remove'],
    mutationFn: (keywords: Array<string>) =>
      client.antennas.removeAntennaKeywords(antennaId, keywords),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.antennas.keywords(antennaId), scopeUrl),
      }),
  });
};

const useAddExcludedKeywordsToAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'keywords', 'addExcluded'],
    mutationFn: (keywords: Array<string>) =>
      client.antennas.addAntennaExcludedKeywords(antennaId, keywords),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.antennas.keywords(antennaId), scopeUrl),
      }),
  });
};

const useRemoveExcludedKeywordsFromAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'keywords', 'removeExcluded'],
    mutationFn: (keywords: Array<string>) =>
      client.antennas.removeAntennaExcludedKeywords(antennaId, keywords),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.antennas.keywords(antennaId), scopeUrl),
      }),
  });
};

const useAntennaTags = (antennaId: string) => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.antennas.tags(antennaId),
    queryFn: () => client.antennas.getAntennaTags(antennaId),
  });
};

const useAddTagsToAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'tags', 'add'],
    mutationFn: (tags: Array<string>) => client.antennas.addAntennaTags(antennaId, tags),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.antennas.tags(antennaId), scopeUrl),
      }),
  });
};

const useRemoveTagsFromAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'tags', 'remove'],
    mutationFn: (tags: Array<string>) => client.antennas.removeAntennaTags(antennaId, tags),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.antennas.tags(antennaId), scopeUrl),
      }),
  });
};

const useAddExcludedTagsToAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'tags', 'addExcluded'],
    mutationFn: (tags: Array<string>) => client.antennas.addAntennaExcludedTags(antennaId, tags),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.antennas.tags(antennaId), scopeUrl),
      }),
  });
};

const useRemoveExcludedTagsFromAntenna = (antennaId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'tags', 'removeExcluded'],
    mutationFn: (tags: Array<string>) => client.antennas.removeAntennaExcludedTags(antennaId, tags),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.antennas.tags(antennaId), scopeUrl),
      }),
  });
};

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
