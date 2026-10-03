import { useMemo } from 'react';

import { useAppQueries, useAppQuery } from '@/queries/query';
import { normalizeStatus, type NormalizedStatus } from '@/queries/statuses/normalize';
import { useImportEntities } from '@/queries/utils/import-entities';
import { useClient } from '@/stores/auth';
import { useContextsActions } from '@/stores/contexts';

import { useAccount } from '../accounts/use-account';
import { queryClient } from '../client';
import { queryKeys } from '../keys';

import type { UseQueryResult } from '@tanstack/react-query';
import type { Context, AsyncRefreshHeader, Account } from 'pl-api';

const minifyContext = ({
  ancestors,
  descendants,
  references,
  ...context
}: Context & { asyncRefreshHeader: AsyncRefreshHeader | null }) => ({
  ancestor_ids: ancestors.map(({ id }) => id),
  descendant_ids: descendants.map(({ id }) => id),
  reference_ids: references.map(({ id }) => id),
  ...context,
});

// type MinifiedContext = ReturnType<typeof minifyContext>;

type SelectedStatus = NormalizedStatus & {
  account: Account;
  reblog: SelectedStatus | null;
  quote: SelectedStatus | null;
};

const useMinimalStatus = (statusId?: string) => {
  const client = useClient();
  const contextsActions = useContextsActions();
  const importEntities = useImportEntities();

  return useAppQuery({
    queryKey: queryKeys.statuses.show(statusId!),
    queryFn: () =>
      client.statuses.getStatus(statusId!).then((status) => {
        importEntities({ statuses: [status] }, { withParents: false });
        contextsActions.importStatus(status);

        return normalizeStatus(status);
      }),
    enabled: !!statusId,
  });
};

const useStatusQuery = (statusId?: string) => {
  const statusQuery = useMinimalStatus(statusId);

  const account = useAccount(statusQuery.data?.account_id ?? undefined);

  return useMemo(() => {
    if (!statusQuery.data) return statusQuery;
    return {
      ...statusQuery,
      data: {
        ...statusQuery.data,
        account: account.data!,
      },
    };
  }, [statusQuery.data, account.data]) as unknown as UseQueryResult<NormalizedStatus>;
};

// const emptyFilters: Array<Filter> = [];
// const emptyFilterResults: Array<FilterResult> = [];
// const selectActiveFilters = (data: Array<Filter>) =>
//   data.filter((filter) => filter.expires_at === null || Date.parse(filter.expires_at) > Date.now());
// const selectNoFilters = () => emptyFilters;

const useStatus = (
  statusId?: string,
  {
    withContext,
    // withFilteredResults,
  }: { withContext?: boolean; withFilteredResults?: boolean } = {},
) => {
  // const features = useFeatures();
  // const withClientSideFilters = !!(!features.filtersV2 && withFilteredResults);

  // const { data: filters } = useFilters(
  //   withClientSideFilters ? selectActiveFilters : selectNoFilters,
  // );

  const { refetch: refetchContext } = useStatusContext(withContext ? statusId : undefined);

  const statusQuery = useStatusQuery(statusId);

  const reblogQuery = useStatusQuery(statusQuery.data?.reblog_id ?? undefined);
  const quoteQuery = useStatusQuery(statusQuery.data?.quote_id ?? undefined);

  return useMemo(() => {
    if (!statusQuery.data) return { ...statusQuery, refetchContext };

    return {
      ...statusQuery,
      data: {
        ...statusQuery.data,
        reblog: reblogQuery.data ?? null,
        quote: quoteQuery.data ?? null,
      },
      refetchContext,
    };
  }, [
    statusQuery.data,
    reblogQuery.data,
    quoteQuery.data,
  ]) as unknown as UseQueryResult<SelectedStatus> & { refetchContext: () => Promise<any> };
};

const useStatusContext = (statusId?: string) => {
  const client = useClient();
  const { importContext, setAsyncRefreshHeader, clearAsyncRefreshHeader } = useContextsActions();
  const importEntities = useImportEntities();

  return useAppQuery({
    queryKey: queryKeys.statuses.contexts(statusId!),
    queryFn: () =>
      client.statuses.getContext(statusId!).then((context) => {
        const { ancestors, descendants, references, asyncRefreshHeader } = context;
        const statuses = [...ancestors, ...descendants, ...references];
        importContext(statusId!, context);
        importEntities({ statuses });

        if (asyncRefreshHeader) {
          setAsyncRefreshHeader(statusId!, asyncRefreshHeader);
        } else {
          clearAsyncRefreshHeader(statusId!);
        }

        return minifyContext(context);
      }),
    enabled: !!statusId,
  });
};

const useStatuses = (statusIds: Array<string>) => {
  const client = useClient();
  const importEntities = useImportEntities();

  return useAppQueries({
    queries: statusIds.map((id) => ({
      queryKey: queryKeys.statuses.show(id),
      queryFn: () =>
        client.statuses.getStatus(id).then((status) => {
          importEntities({ statuses: [status] }, { withParents: true });
          return normalizeStatus(status);
        }),
      enabled: !!id,
    })),
  });
};

const findStatuses = (
  predicate: (status: NormalizedStatus) => boolean,
  scopeUrl?: string,
): Array<[string, NormalizedStatus]> =>
  queryClient
    .getQueriesData<NormalizedStatus>({
      predicate: ({ queryKey }) =>
        queryKey.length === 3 &&
        queryKey[1] === 'statuses' &&
        typeof queryKey[2] === 'string' &&
        (!scopeUrl || queryKey[0] === scopeUrl),
    })
    .filter(
      (entry): entry is [readonly [string, 'statuses', string], NormalizedStatus] =>
        entry[1] !== undefined && predicate(entry[1]),
    )
    .map(([key, data]) => [key[2], data]);

export { useStatus, useStatusContext, useStatuses, findStatuses };
