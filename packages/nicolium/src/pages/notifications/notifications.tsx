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
  refresh: { id: 'notifications.refresh', defaultMessage: 'Refresh notifications' },
});

const RefreshButton = () => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const activeFilter = useSettings().notifications.quickFilter.active;
  const { isPending, refetch } = useNotifications(activeFilter);

  if (userTouching.matches) return null;

  const handleClick = () => {
    queryClient.resetQueries({ queryKey: queryKeys.notifications.list(activeFilter) });
    refetch();
  };

  return (
    <IconButton
      disabled={isPending}
      className='text-gray-600 hover:text-gray-700 dark:hover:text-gray-500'
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
