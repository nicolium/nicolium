import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import Widget from '@/components/ui/widget';
import { useAdminAccounts } from '@/queries/admin/use-accounts';

const messages = defineMessages({
  expand: {
    id: 'admin.latest_accounts_panel.more',
    defaultMessage: 'Click to see {count, plural, one {# account} other {# accounts}}',
  },
});

interface ILatestAccountsPanel {
  limit?: number;
}

const LatestAccountsPanel: React.FC<ILatestAccountsPanel> = ({ limit = 5 }) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const { data: accountIds } = useAdminAccounts({
    origin: 'local',
    status: 'active',
    // limit,
  });

  const total = accountIds?.total;

  const handleAction = () => {
    navigate({ to: '/nicolium/admin/accounts', search: { origin: 'local', status: 'active' } });
  };

  return (
    <Widget
      title={
        <FormattedMessage id='admin.latest_accounts_panel.title' defaultMessage='Latest accounts' />
      }
      onActionClick={handleAction}
      actionTitle={intl.formatMessage(messages.expand, { count: total })}
    >
      {accountIds?.slice(0, limit).map((account) => (
        <AccountContainer key={account} id={account} withRelationship={false} withDate />
      ))}
    </Widget>
  );
};

export { LatestAccountsPanel as default };
