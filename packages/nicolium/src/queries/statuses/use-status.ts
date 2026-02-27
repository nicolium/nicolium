import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';

import { importEntities } from '@/actions/importer';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';
import { type NormalizedStatus, normalizeStatus } from '@/reducers/statuses';
import { useContextsActions } from '@/stores/contexts';

import { useAccount } from '../accounts/use-account';
import { useAccounts } from '../accounts/use-accounts';
import { queryKeys } from '../keys';

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

type MinifiedContext = ReturnType<typeof minifyContext>;

type SelectedStatus = NormalizedStatus & {
  account: Account;
  accounts?: Array<Account>;
  reblog?: SelectedStatus;
  quote?: SelectedStatus;
};

const useStatusQuery = (statusId?: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  const statusQuery = useQuery({
    queryKey: queryKeys.statuses.show(statusId!),
    queryFn: () =>
      client.statuses.getStatus(statusId!).then((status) => {
        const normalizedStatus = normalizeStatus(status);

        dispatch({
          type: 'STATUS_IMPORT',
          status,
          skipQueryDataUpdate: true,
        });
        dispatch(importEntities({ statuses: [status] }, { withParents: false }));

        return normalizedStatus;
      }),
    enabled: !!statusId,
  });

  const account = useAccount(statusQuery.data?.account_id ?? undefined);
  const { data: accounts } = useAccounts(
    statusQuery.data?.account_id ? [statusQuery.data.account_id] : [],
  );

  return useMemo(() => {
    if (!statusQuery.data) return statusQuery;
    return {
      ...statusQuery,
      data: {
        ...statusQuery.data,
        account: account.data!,
        accounts,
      },
    };
  }, [statusQuery.data, account.data, accounts]) as unknown as UseQueryResult<NormalizedStatus>;
};

const useStatus = (
  statusId?: string,
  { withContext }: { withContext?: boolean; contextType?: string } = {},
) => {
  const { refetch: refetchContext } = useStatusContext(withContext ? statusId : undefined);

  const statusQuery = useStatusQuery(statusId);

  const reblogQuery = useStatusQuery(statusQuery.data?.reblog_id ?? undefined);
  const quoteQuery = useStatusQuery(statusQuery.data?.quote_id ?? undefined);

  const account = useAccount(statusQuery.data?.account_id ?? undefined);

  return useMemo(() => {
    if (!statusQuery.data) return { ...statusQuery, refetchContext };
    return {
      ...statusQuery,
      data: {
        ...statusQuery.data,
        account: account.data!,
        reblog: reblogQuery.data,
        quote: quoteQuery.data,
      },
      refetchContext,
    };
  }, [
    statusQuery.data,
    reblogQuery.data,
    quoteQuery.data,
    account.data,
  ]) as unknown as UseQueryResult<SelectedStatus> & { refetchContext: () => void };
};

const useStatusContext = (statusId?: string) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const { importContext } = useContextsActions();

  return useQuery({
    queryKey: queryKeys.statuses.contexts(statusId!),
    queryFn: () =>
      client.statuses.getContext(statusId!).then((context) => {
        const { ancestors, descendants, references } = context;
        const statuses = [...ancestors, ...descendants, ...references];
        importContext(statusId!, context);
        dispatch(importEntities({ statuses }));
        return minifyContext(context);
      }),
    enabled: !!statusId,
  });
};

export { useStatus, useStatusContext, type MinifiedContext, type SelectedStatus };
