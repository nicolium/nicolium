import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import UnapprovedAccount from '@/features/admin/components/unapproved-account';
import { useAdminAccounts } from '@/queries/admin/use-accounts';

const messages = defineMessages({
  heading: { id: 'column.admin.awaiting_approval', defaultMessage: 'Awaiting approval' },
});

const AwaitingApproval: React.FC = () => {
  const intl = useIntl();

  const { data, isPending, isFetching } = useAdminAccounts({
    origin: 'local',
    status: 'pending',
  });

  const [accountIds, setAccountIds] = useState(data ?? []);

  useEffect(() => {
    if (data && data.length > accountIds.length) setAccountIds(data);
  }, [data]);

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='awaitingApproval'
        isLoading={isFetching}
        showLoading={isPending}
        emptyMessageText={<FormattedMessage id='admin.awaiting_approval.empty_message' defaultMessage='There is nobody waiting for approval. When a new user signs up, you can review them here.' />}
        listClassName='⁂-status-list'
      >
        {accountIds.map(id => (
          <div key={id} className='px-5 py-4'>
            <UnapprovedAccount accountId={id} />
          </div>
        ))}
      </ScrollableList>
    </Column>
  );
};

export { AwaitingApproval as default };
