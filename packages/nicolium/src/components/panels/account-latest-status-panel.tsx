import React from 'react';

import StatusContainer from '@/components/statuses/status-container';
import Widget from '@/components/ui/widget';
import { useClient } from '@/hooks/use-client';
import { useAccount } from '@/queries/accounts/use-account';
import { queryKeys } from '@/queries/keys';
import { useAppQuery } from '@/queries/query';
import { useImportEntities } from '@/queries/utils/import-entities';

import Spinner from '../ui/spinner';

interface IAccountLatestStatusPanel {
  accountId: string;
}

const AccountLatestStatusPanel: React.FC<IAccountLatestStatusPanel> = ({ accountId }) => {
  const client = useClient();
  const { data: account } = useAccount(accountId);
  const importEntities = useImportEntities();

  const { data: statusId, isFetching } = useAppQuery({
    queryKey: queryKeys.accounts.latestStatus(accountId),
    queryFn: () =>
      client.accounts
        .getAccountStatuses(accountId, {
          exclude_replies: true,
          exclude_reblogs: true,
          limit: 1,
        })
        .then((response) => {
          importEntities({ statuses: response.items });
          return response.items[0]?.id ?? null;
        }),
  });

  if (!account || (!isFetching && !statusId)) return null;

  return (
    <Widget className='account-latest-status-panel'>
      {statusId ? (
        <StatusContainer
          id={statusId}
          focusable={false}
          hideActionBar
          variant='slim'
          expandable={false}
        />
      ) : (
        <Spinner withText={false} />
      )}
    </Widget>
  );
};

export { AccountLatestStatusPanel as default };
