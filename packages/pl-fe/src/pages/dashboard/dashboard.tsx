import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Switch, Route } from 'react-router-dom';

import Column from 'pl-fe/components/ui/column';
import AdminTabs from 'pl-fe/features/admin/components/admin-tabs';
import Waitlist from 'pl-fe/features/admin/tabs/awaiting-approval';
import Dashboard from 'pl-fe/features/admin/tabs/dashboard';
import Reports from 'pl-fe/features/admin/tabs/reports';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';

const messages = defineMessages({
  heading: { id: 'column.admin.dashboard', defaultMessage: 'Dashboard' },
});

const DashboardPage: React.FC = () => {
  const intl = useIntl();
  const { account } = useOwnAccount();

  if (!account) return null;

  return (
    <Column label={intl.formatMessage(messages.heading)} withHeader={false}>
      <AdminTabs />

      <Switch>
        <Route path='/pl-fe/admin' exact component={Dashboard} />
        <Route path='/pl-fe/admin/reports' exact component={Reports} />
        <Route path='/pl-fe/admin/approval' exact component={Waitlist} />
      </Switch>
    </Column>
  );
};

export { DashboardPage as default };
