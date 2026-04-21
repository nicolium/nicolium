import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import NotificationsColumn from '@/columns/notifications';
import DropdownMenu, { type MenuItem } from '@/components/dropdown-menu';
import Column from '@/components/ui/column';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  title: { id: 'column.notifications', defaultMessage: 'Notifications' },
  advanced: {
    id: 'preferences.notifications.advanced',
    defaultMessage: 'Show all notification categories',
  },
});

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
      action={<DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />}
    >
      <NotificationsColumn />
    </Column>
  );
};

export { NotificationsPage as default };
