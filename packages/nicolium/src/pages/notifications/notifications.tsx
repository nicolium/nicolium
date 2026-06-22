import iconArrowsClockwise from '@phosphor-icons/core/regular/arrows-clockwise.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import NotificationsColumn from '@/columns/notifications';
import DropdownMenu, { type MenuItem } from '@/components/dropdown-menu';
import Column from '@/components/ui/column';
import IconButton from '@/components/ui/icon-button';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { useNotifications } from '@/queries/notifications/use-notifications';
import { useSettings } from '@/stores/settings';
import { userTouching } from '@/utils/is-mobile';

const messages = defineMessages({
  title: { id: 'column.notifications', defaultMessage: 'Notifications' },
  advanced: {
    id: 'preferences.notifications.advanced',
    defaultMessage: 'Show all notification categories',
  },
  includeBots: {
    id: 'preferences.notifications.include_bots',
    defaultMessage: 'Include automated accounts',
  },
  refresh: { id: 'notifications.refresh', defaultMessage: 'Refresh notifications' },
});

const RefreshButton = () => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const notificationSettings = useSettings().notifications;
  const { isPending, refetch } = useNotifications(notificationSettings.quickFilter.active);
  const scopeUrl = useScopeUrl();

  if (userTouching.matches) return null;

  const handleClick = () => {
    queryClient.resetQueries({
      queryKey: [
        scopeUrl,
        ...queryKeys.notifications.list(
          notificationSettings.quickFilter.active,
          notificationSettings.hideBots,
        ),
      ],
    });
    refetch();
  };

  return (
    <IconButton
      disabled={isPending}
      className='timeline-refresh-button'
      title={intl.formatMessage(messages.refresh)}
      src={iconArrowsClockwise}
      onClick={handleClick}
    />
  );
};

const NotificationsPage = () => {
  const intl = useIntl();
  const settings = useSettings();

  const items: Array<MenuItem> = [
    {
      text: intl.formatMessage(messages.advanced),
      type: 'toggle',
      checked: settings.notifications.quickFilter.advanced,
      onChange: (value) => changeSetting(['notifications', 'quickFilter', 'advanced'], value),
    },
    {
      text: intl.formatMessage(messages.includeBots),
      type: 'toggle',
      checked: !settings.notifications.hideBots,
      onChange: (value) => changeSetting(['notifications', 'hideBots'], !value),
    },
  ];

  return (
    <Column
      label={intl.formatMessage(messages.title)}
      action={
        <>
          <RefreshButton />
          <DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />
        </>
      }
    >
      <NotificationsColumn />
    </Column>
  );
};

export { NotificationsPage as default };
