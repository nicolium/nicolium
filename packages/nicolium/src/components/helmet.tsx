import React, { useEffect } from 'react';

import { useStatContext } from '@/contexts/stat-context';
import { usePendingUsersCount } from '@/queries/admin/use-accounts';
import { usePendingReportsCount } from '@/queries/admin/use-reports';
import { useNotificationsUnreadCount } from '@/queries/notifications/use-notifications';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';
import FaviconService from '@/utils/favicon-service';

FaviconService.initFaviconService();

interface IHeadTitle {
  title?: string;
}

const HeadTitle: React.FC<IHeadTitle> = ({ title }) => {
  const instance = useInstance();
  const { unreadChatsCount } = useStatContext();
  const { data: awaitingApprovalCount = 0 } = usePendingUsersCount();
  const { data: pendingReportsCount = 0 } = usePendingReportsCount();
  const notificationCount = useNotificationsUnreadCount();
  const unreadCount =
    notificationCount + unreadChatsCount + awaitingApprovalCount + pendingReportsCount;
  const { demetricator } = useSettings();

  const hasUnreadNotifications = React.useMemo(
    () => !(unreadCount < 1 || demetricator),
    [unreadCount, demetricator],
  );

  const addCounter = (string: string) =>
    hasUnreadNotifications ? `(${unreadCount}) ${string}` : string;

  useEffect(() => {
    if (hasUnreadNotifications) {
      FaviconService.drawFaviconBadge();
    } else {
      FaviconService.clearFaviconBadge();
    }
  }, [unreadCount, demetricator]);

  const formattedTitle = title
    ? addCounter(`${title} | ${instance.title}`)
    : addCounter(instance.title);

  return <title>{formattedTitle}</title>;
};

export { HeadTitle as default };
