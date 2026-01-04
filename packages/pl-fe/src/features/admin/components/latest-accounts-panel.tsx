import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Widget from 'pl-fe/components/ui/widget';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAdminAccounts } from 'pl-fe/queries/admin/use-accounts';

const messages = defineMessages({
  title: { id: 'admin.latest_accounts_panel.title', defaultMessage: 'Latest Accounts' },
  expand: { id: 'admin.latest_accounts_panel.more', defaultMessage: 'Click to see {count, plural, one {# account} other {# accounts}}' },
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
    navigate({ to: '/pl-fe/admin/users' });
  };

  return (
    <Widget
      title={intl.formatMessage(messages.title)}
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
