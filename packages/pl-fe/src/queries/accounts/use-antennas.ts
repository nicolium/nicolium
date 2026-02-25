import {
  type InfiniteData,
  useMutation,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

import { queryClient } from '../client';
import { filterById } from '../utils/filter-id';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyAccountList } from '../utils/minify-list';

import type { Antenna, PaginatedResponse, CreateAntennaParams, UpdateAntennaParams } from 'pl-api';

function useAntennas<T>(select: (data: Array<Antenna>) => T): UseQueryResult<T, Error>;
function useAntennas(): UseQueryResult<Array<Antenna>, Error>;
function useAntennas<T = Array<Antenna>>(select?: (data: Array<Antenna>) => T) {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: ['antennas'],
    queryFn: () => client.antennas.fetchAntennas(),
    enabled: features.antennas,
    select,
  });
}

const useAntenna = (antennaId?: string) =>
  useAntennas((data) => (antennaId ? data.find((antenna) => antenna.id === antennaId) : undefined));

const useCreateAntenna = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', 'create'],
    mutationFn: (params: CreateAntennaParams) => client.antennas.createAntenna(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['antennas'] }),
  });
};

const useDeleteAntenna = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', 'delete'],
    mutationFn: (antennaId: string) => client.antennas.deleteAntenna(antennaId),
    onSuccess: (_, deletedAntennaId) => {
      queryClient.setQueryData<Array<Antenna>>(['antennas'], (prevData) =>
        prevData?.filter(({ id }) => id !== deletedAntennaId),
      );
    },
  });
};

const useUpdateAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', 'update', antennaId],
    mutationFn: (params: UpdateAntennaParams) => client.antennas.updateAntenna(antennaId, params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['antennas'] }),
  });
};

const useAntennaAccounts = makePaginatedResponseQuery(
  (antennaId: string) => ['accountsLists', 'antennas', antennaId],
  (client, [antennaId]) => client.antennas.getAntennaAccounts(antennaId).then(minifyAccountList),
);

const useAddAccountsToAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'antennas', antennaId, 'add'],
    mutationFn: (accountIds: Array<string>) =>
      client.antennas.addAntennaAccounts(antennaId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'antennas', antennaId] });
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
      queryClient.setQueryData<InfiniteData<PaginatedResponse<string>>>(
        ['accountsLists', 'antennas', antennaId],
        filterById(accountIds),
      );
    },
  });
};

const useAntennaExcludedAccounts = makePaginatedResponseQuery(
  (antennaId: string) => ['accountsLists', 'antennas', antennaId, 'excluded'],
  (client, [antennaId]) =>
    client.antennas.getAntennaExcludedAccounts(antennaId).then(minifyAccountList),
);

const useAddExcludedAccountsToAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'antennas', antennaId, 'addExcluded'],
    mutationFn: (accountIds: Array<string>) =>
      client.antennas.addAntennaExcludedAccounts(antennaId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'antennas', antennaId] });
    },
  });
};

const useRemoveExcludedAccountsFromAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'antennas', antennaId, 'removeExcluded'],
    mutationFn: (accountIds: Array<string>) =>
      client.antennas.removeAntennaExcludedAccounts(antennaId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.setQueryData<InfiniteData<PaginatedResponse<string>>>(
        ['accountsLists', 'antennas', antennaId],
        filterById(accountIds),
      );
    },
  });
};

const useAntennaDomains = (antennaId: string) => {
  const client = useClient();

  return useQuery({
    queryKey: ['antennas', antennaId, 'domains'],
    queryFn: () => client.antennas.getAntennaDomains(antennaId),
  });
};

const useAddDomainsToAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'domains', 'add'],
    mutationFn: (domains: Array<string>) => client.antennas.addAntennaDomains(antennaId, domains),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['antennas', antennaId, 'domains'] }),
  });
};

const useRemoveDomainsFromAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'domains', 'remove'],
    mutationFn: (domains: Array<string>) =>
      client.antennas.removeAntennaDomains(antennaId, domains),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['antennas', antennaId, 'domains'] }),
  });
};

const useAddExcludedDomainsToAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'domains', 'addExcluded'],
    mutationFn: (domains: Array<string>) =>
      client.antennas.addAntennaExcludedDomains(antennaId, domains),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['antennas', antennaId, 'domains'] }),
  });
};

const useRemoveExcludedDomainsFromAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'domains', 'removeExcluded'],
    mutationFn: (domains: Array<string>) =>
      client.antennas.removeAntennaExcludedDomains(antennaId, domains),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['antennas', antennaId, 'domains'] }),
  });
};

const useAntennaKeywords = (antennaId: string) => {
  const client = useClient();

  return useQuery({
    queryKey: ['antennas', antennaId, 'keywords'],
    queryFn: () => client.antennas.getAntennaKeywords(antennaId),
  });
};

const useAddKeywordsToAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'keywords', 'add'],
    mutationFn: (keywords: Array<string>) =>
      client.antennas.addAntennaKeywords(antennaId, keywords),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['antennas', antennaId, 'keywords'] }),
  });
};

const useRemoveKeywordsFromAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'keywords', 'remove'],
    mutationFn: (keywords: Array<string>) =>
      client.antennas.removeAntennaKeywords(antennaId, keywords),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['antennas', antennaId, 'keywords'] }),
  });
};

const useAddExcludedKeywordsToAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'keywords', 'addExcluded'],
    mutationFn: (keywords: Array<string>) =>
      client.antennas.addAntennaExcludedKeywords(antennaId, keywords),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['antennas', antennaId, 'keywords'] }),
  });
};

const useRemoveExcludedKeywordsFromAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'keywords', 'removeExcluded'],
    mutationFn: (keywords: Array<string>) =>
      client.antennas.removeAntennaExcludedKeywords(antennaId, keywords),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['antennas', antennaId, 'keywords'] }),
  });
};

const useAntennaTags = (antennaId: string) => {
  const client = useClient();

  return useQuery({
    queryKey: ['antennas', antennaId, 'tags'],
    queryFn: () => client.antennas.getAntennaTags(antennaId),
  });
};

const useAddTagsToAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'tags', 'add'],
    mutationFn: (tags: Array<string>) => client.antennas.addAntennaTags(antennaId, tags),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['antennas', antennaId, 'tags'] }),
  });
};

const useRemoveTagsFromAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'tags', 'remove'],
    mutationFn: (tags: Array<string>) => client.antennas.removeAntennaTags(antennaId, tags),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['antennas', antennaId, 'tags'] }),
  });
};

const useAddExcludedTagsToAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'tags', 'addExcluded'],
    mutationFn: (tags: Array<string>) => client.antennas.addAntennaExcludedTags(antennaId, tags),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['antennas', antennaId, 'tags'] }),
  });
};

const useRemoveExcludedTagsFromAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['antennas', antennaId, 'tags', 'removeExcluded'],
    mutationFn: (tags: Array<string>) => client.antennas.removeAntennaExcludedTags(antennaId, tags),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['antennas', antennaId, 'tags'] }),
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
