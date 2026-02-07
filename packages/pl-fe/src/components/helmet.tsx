import React from 'react';
import { Helmet as ReactHelmet } from 'react-helmet-async';

import { useStatContext } from '@/contexts/stat-context';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useInstance } from '@/hooks/use-instance';
import { usePendingUsersCount } from '@/queries/admin/use-accounts';
import { usePendingReportsCount } from '@/queries/admin/use-reports';
import { useSettings } from '@/stores/settings';
import FaviconService from '@/utils/favicon-service';

FaviconService.initFaviconService();

interface IHelmet {
  children: React.ReactNode;
}

const Helmet: React.FC<IHelmet> = ({ children }) => {
  const instance = useInstance();
  const { unreadChatsCount } = useStatContext();
  const { data: awaitingApprovalCount = 0 } = usePendingUsersCount();
  const { data: pendingReportsCount = 0 } = usePendingReportsCount();
  const unreadCount = useAppSelector((state) => (state.notifications.unread || 0) + unreadChatsCount + awaitingApprovalCount + pendingReportsCount);
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
