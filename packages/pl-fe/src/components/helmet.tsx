import React from 'react';
import { Helmet as ReactHelmet } from 'react-helmet-async';

import { useStatContext } from 'pl-fe/contexts/stat-context';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { usePendingUsersCount } from 'pl-fe/queries/admin/use-accounts';
import { RootState } from 'pl-fe/store';
import FaviconService from 'pl-fe/utils/favicon-service';

FaviconService.initFaviconService();

const getNotifTotals = (state: RootState): number => {
  const notifications = state.notifications.unread || 0;
  const reports = state.admin.openReports.length;
  return notifications + reports;
};

interface IHelmet {
  children: React.ReactNode;
}

const Helmet: React.FC<IHelmet> = ({ children }) => {
  const instance = useInstance();
  const { unreadChatsCount } = useStatContext();
  const { data: awaitingApprovalCount = 0 } = usePendingUsersCount();
  const unreadCount = useAppSelector((state) => getNotifTotals(state) + unreadChatsCount + awaitingApprovalCount);
  const { demetricator } = useSettings();

  const hasUnreadNotifications = React.useMemo(() => !(unreadCount < 1 || demetricator), [unreadCount, demetricator]);

  const addCounter = (string: string) => hasUnreadNotifications ? `(${unreadCount}) ${string}` : string;

  const updateFaviconBadge = () => {
    if (hasUnreadNotifications) {
      FaviconService.drawFaviconBadge();
    } else {
      FaviconService.clearFaviconBadge();
    }
  };

  React.useEffect(() => {
    updateFaviconBadge();
  }, [unreadCount, demetricator]);

  return (
    <ReactHelmet
      titleTemplate={addCounter(`%s | ${instance.title}`)}
      defaultTitle={addCounter(instance.title)}
      defer={false}
    >
      {children}
    </ReactHelmet>
  );
};

export { Helmet as default };
