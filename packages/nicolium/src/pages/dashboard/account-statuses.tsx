import iconChatCenteredText from '@phosphor-icons/core/regular/chat-centered-text.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { AdminAccountTimelineColumn } from '@/columns/timeline';
import Column from '@/components/ui/column';
import { useAccount } from '@/queries/accounts/use-account';
import { adminAccountStatusesRoute } from '@/router';

const messages = defineMessages({
  header: { id: 'column.admin.account_statuses', defaultMessage: 'All posts by @{acct}' },
});

const AccountStatusesPage: React.FC = () => {
  const { accountId } = adminAccountStatusesRoute.useParams();

  const { data: account } = useAccount(accountId);

  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.header, { acct: account?.acct || '' })}>
      <AdminAccountTimelineColumn
        accountId={accountId}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.admin_account_timeline'
            defaultMessage='There are no posts by this account yet.'
          />
        }
        emptyMessageIcon={iconChatCenteredText}
      />
    </Column>
  );
};

export { AccountStatusesPage as default };
