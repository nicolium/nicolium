import { useLocation } from '@tanstack/react-router';
import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import Tabs, { type Item } from 'pl-fe/components/ui/tabs';
import { usePendingUsersCount } from 'pl-fe/queries/admin/use-accounts';
import { usePendingReportsCount } from 'pl-fe/queries/admin/use-reports';

const messages = defineMessages({
  dashboard: { id: 'admin_nav.dashboard', defaultMessage: 'Dashboard' },
  reports: { id: 'admin_nav.reports', defaultMessage: 'Reports' },
  waitlist: { id: 'admin_nav.awaiting_approval', defaultMessage: 'Waitlist' },
});

const AdminTabs: React.FC = () => {
  const intl = useIntl();
  const location = useLocation();

  const { data: awaitingApprovalCount } = usePendingUsersCount();
  const { data: pendingReportsCount = 0 } = usePendingReportsCount();

  const tabs: Array<Item> = [{
    name: '/pl-fe/admin',
    text: intl.formatMessage(messages.dashboard),
    to: '/pl-fe/admin',
  }, {
    name: '/pl-fe/admin/reports',
    text: intl.formatMessage(messages.reports),
    to: '/pl-fe/admin/reports',
    count: pendingReportsCount,
  }, {
    name: '/pl-fe/admin/approval',
    text: intl.formatMessage(messages.waitlist),
    to: '/pl-fe/admin/approval',
    count: awaitingApprovalCount,
  }];

  return <Tabs items={tabs} activeItem={location.pathname} />;
};

export { AdminTabs as default };
