import { type InfiniteData, useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';

import { queryClient } from '../client';
import { filterById } from '../utils/filter-id';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { minifyAccountList } from '../utils/minify-list';

import type { Antenna, PaginatedResponse, CreateAntennaParams, UpdateAntennaParams } from 'pl-api';

const useAntennas = <T>(
  select?: ((data: Array<Antenna>) => T),
) => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: ['antennas'],
    queryFn: () => client.antennas.fetchAntennas(),
    enabled: features.antennas,
    select,
  });
};

const useAntenna = (antennaId?: string) => useAntennas((data) => antennaId ? data.find(antenna => antenna.id === antennaId) : undefined);

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
      queryClient.setQueryData<Array<Antenna>>(
        ['antennas'],
        (prevData) => prevData?.filter(({ id }) => id !== deletedAntennaId),
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
    mutationFn: (accountIds: Array<string>) => client.antennas.addAntennaAccounts(antennaId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'antennas', antennaId] });
    },
  });
};

const useRemoveAccountsFromAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'antennas', antennaId, 'remove'],
    mutationFn: (accountIds: Array<string>) => client.antennas.removeAntennaAccounts(antennaId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.setQueryData<InfiniteData<PaginatedResponse<string>>>(['accountsLists', 'antennas', antennaId], filterById(accountIds));
    },
  });
};

const useAntennaExcludedAccounts = makePaginatedResponseQuery(
  (antennaId: string) => ['accountsLists', 'antennas', antennaId, 'excluded'],
  (client, [antennaId]) => client.antennas.getAntennaExcludedAccounts(antennaId).then(minifyAccountList),
);

const useAddExcludedAccountsToAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'antennas', antennaId, 'addExcluded'],
    mutationFn: (accountIds: Array<string>) => client.antennas.addAntennaExcludedAccounts(antennaId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'antennas', antennaId] });
    },
  });
};

const useRemoveExcludedAccountsFromAntenna = (antennaId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['accountsLists', 'antennas', antennaId, 'removeExcluded'],
    mutationFn: (accountIds: Array<string>) => client.antennas.removeAntennaExcludedAccounts(antennaId, accountIds),
    onSettled: (_, __, accountIds) => {
      queryClient.setQueryData<InfiniteData<PaginatedResponse<string>>>(['accountsLists', 'antennas', antennaId], filterById(accountIds));
    },
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
};
