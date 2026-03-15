import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useMemo } from 'react';

import { decrementReplyCount, incrementReplyCount } from '@/actions/statuses';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { normalizeStatus, type NormalizedStatus } from '@/normalizers/status';
import { useFilters } from '@/queries/settings/use-filters';
import { importEntities } from '@/queries/utils/import-entities';
import { useComposeActions } from '@/stores/compose';
import { useContextsActions } from '@/stores/contexts';
import { useModalsActions } from '@/stores/modals';
import { usePendingStatusesActions } from '@/stores/pending-statuses';
import { useStatusMetaActions } from '@/stores/status-meta';
import { useTimelinesActions } from '@/stores/timelines';
import { checkFiltered } from '@/utils/filters';

import { useAccount } from '../accounts/use-account';
import { queryClient } from '../client';
import { queryKeys } from '../keys';

import type { Context, AsyncRefreshHeader, Account, Filter, FilterResult } from 'pl-api';

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

type MinifiedContext = ReturnType<typeof minifyContext>;

type SelectedStatus = NormalizedStatus & {
  account: Account;
  reblog: SelectedStatus | null;
  quote: SelectedStatus | null;
};

const useMinimalStatus = (statusId?: string) => {
  const client = useClient();
  const contextsActions = useContextsActions();

  return useQuery({
    queryKey: queryKeys.statuses.show(statusId!),
    queryFn: () =>
      client.statuses.getStatus(statusId!).then((status) => {
        // Import related entities (accounts, polls, etc.) into the RQ cache
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

const emptyFilters: Array<Filter> = [];
const emptyFilterResults: Array<FilterResult> = [];
const selectAllFilters = (data: Array<Filter>) => data;
const selectNoFilters = () => emptyFilters;

const useStatus = (
  statusId?: string,
  {
    withContext,
    withFilteredResults,
  }: { withContext?: boolean; withFilteredResults?: boolean } = {},
) => {
  const features = useFeatures();
  const withClientSideFilters = !!(features.filters && !features.filtersV2 && withFilteredResults);

  const { data: filters } = useFilters(withClientSideFilters ? selectAllFilters : selectNoFilters);

  const { refetch: refetchContext } = useStatusContext(withContext ? statusId : undefined);

  const statusQuery = useStatusQuery(statusId);

  const reblogQuery = useStatusQuery(statusQuery.data?.reblog_id ?? undefined);
  const quoteQuery = useStatusQuery(statusQuery.data?.quote_id ?? undefined);

  const clientFilterResults = useMemo(() => {
    if (!withClientSideFilters || !filters?.length || !statusQuery.data) return emptyFilterResults;
    return checkFiltered(statusQuery.data.search_index, filters);
  }, [withClientSideFilters, filters, statusQuery.data?.search_index]);

  return useMemo(() => {
    if (!statusQuery.data) return { ...statusQuery, refetchContext };

    const filtered = withClientSideFilters ? clientFilterResults : statusQuery.data.filtered;

    return {
      ...statusQuery,
      data: {
        ...statusQuery.data,
        reblog: reblogQuery.data ?? null,
        quote: quoteQuery.data ?? null,
        filtered,
      },
      refetchContext,
    };
  }, [
    statusQuery.data,
    reblogQuery.data,
    quoteQuery.data,
    clientFilterResults,
  ]) as unknown as UseQueryResult<SelectedStatus> & { refetchContext: () => void };
};

const useStatusContext = (statusId?: string) => {
  const client = useClient();
  const { importContext } = useContextsActions();

  return useQuery({
    queryKey: queryKeys.statuses.contexts(statusId!),
    queryFn: () =>
      client.statuses.getContext(statusId!).then((context) => {
        const { ancestors, descendants, references } = context;
        const statuses = [...ancestors, ...descendants, ...references];
        importContext(statusId!, context);
        importEntities({ statuses });
        return minifyContext(context);
      }),
    enabled: !!statusId,
  });
};

const useStatuses = (statusIds: Array<string>) => {
  const client = useClient();

  return useQueries({
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
): Array<[string, NormalizedStatus]> =>
  queryClient
    .getQueriesData<NormalizedStatus>({ queryKey: queryKeys.statuses.root })
    .filter(
      (entry): entry is [readonly ['statuses', string], NormalizedStatus] =>
        entry[0].length === 2 &&
        typeof entry[0][1] === 'string' &&
        entry[1] !== undefined &&
        predicate(entry[1]),
    )
    .map(([key, data]) => [key[1], data]);

const useDeleteStatus = (statusId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const { markStatusDeleted } = useStatusMetaActions();
  const { deleteStatus: deletePendingStatus } = usePendingStatusesActions();
  const { deleteStatus: deleteStatusFromTimelines } = useTimelinesActions();
  const { setComposeToStatus } = useComposeActions();
  const { openModal } = useModalsActions();

  return useMutation({
    mutationFn: (_withRedraft?: boolean) => client.statuses.deleteStatus(statusId),
    onMutate: () => {
      const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
      if (!status) return;

      decrementReplyCount(status, queryClient);
    },
    onSuccess: (source, withRedraft) => {
      const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));

      const poll = status?.poll_id
        ? queryClient.getQueryData(queryKeys.statuses.polls.show(status.poll_id))
        : undefined;

      deletePendingStatus(statusId);
      deleteStatusFromTimelines(statusId);
      markStatusDeleted(statusId);

      if (withRedraft && status) {
        setComposeToStatus(status, poll, source, withRedraft);
        openModal('COMPOSE');
      }
    },
    onError: () => {
      const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
      if (!status) return;

      incrementReplyCount(status, queryClient);
    },
  });
};

const useDeleteStatusFromGroup = (statusId: string, groupId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const { markStatusDeleted } = useStatusMetaActions();
  const { deleteStatus: deletePendingStatus } = usePendingStatusesActions();
  const { deleteStatus: deleteStatusFromTimelines } = useTimelinesActions();

  return useMutation({
    mutationFn: () => client.experimental.groups.deleteGroupStatus(statusId, groupId),
    onMutate: () => {
      const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
      if (!status) return;

      decrementReplyCount(status, queryClient);
    },
    onSuccess: () => {
      deletePendingStatus(statusId);
      deleteStatusFromTimelines(statusId);
      markStatusDeleted(statusId);
    },
    onError: () => {
      const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
      if (!status) return;

      incrementReplyCount(status, queryClient);
    },
  });
};

export {
  useMinimalStatus,
  useStatus,
  useStatusContext,
  useStatuses,
  useDeleteStatus,
  useDeleteStatusFromGroup,
  findStatuses,
  type MinifiedContext,
  type SelectedStatus,
};
