import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import { useAdminAccounts } from 'pl-fe/queries/admin/use-accounts';

import UnapprovedAccount from '../components/unapproved-account';

const AwaitingApproval: React.FC = () => {
  const { data, isPending, isFetching } = useAdminAccounts({
    origin: 'local',
    status: 'pending',
  });

  const [accountIds, setAccountIds] = useState(data || []);

  useEffect(() => {
    if (data && data.length > accountIds.length) setAccountIds(data);
  }, [data]);

  return (
    <ScrollableList
      scrollKey='awaitingApproval'
      isLoading={isFetching}
      showLoading={isPending}
      emptyMessageText={<FormattedMessage id='admin.awaiting_approval.empty_message' defaultMessage='There is nobody waiting for approval. When a new user signs up, you can review them here.' />}
      listClassName='divide-y divide-solid divide-gray-200 black:divide-gray-800 dark:divide-primary-800'
    >
      {accountIds.map(id => (
        <div key={id} className='px-5 py-4'>
          <UnapprovedAccount accountId={id} />
        </div>
      ))}
    </ScrollableList>
  );
};

export { AwaitingApproval as default };
