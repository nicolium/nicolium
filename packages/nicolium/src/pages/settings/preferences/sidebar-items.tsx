import iconDotsSixVertical from '@phosphor-icons/core/regular/dots-six-vertical.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import OutlineBox from '@/components/outline-box';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import Icon from '@/components/ui/icon';
import StreamfieldPicker from '@/components/ui/streamfield-picker';
import { AVAILABLE_SIDEBAR_ITEMS } from '@/schemas/frontend-settings';
import { useSettings } from '@/stores/settings';

import type { StreamfieldComponent } from '@/components/ui/streamfield';

const messages = defineMessages({
  heading: { id: 'settings.sidebar_items.heading', defaultMessage: 'Sidebar items' },
});

const itemsMessages = {
  context: { id: 'settings.sidebar_items.item.context', defaultMessage: 'Context' },
  announcements: {
    id: 'settings.sidebar_items.item.announcements',
    defaultMessage: 'Announcements',
  },
  recommendations: {
    id: 'settings.sidebar_items.item.recommendations',
    defaultMessage: 'Recommendations',
  },
  promo: { id: 'settings.sidebar_items.item.promo', defaultMessage: 'Promotional' },
  footer: { id: 'settings.sidebar_items.item.footer', defaultMessage: 'Footer' },
  compose: { id: 'settings.sidebar_items.item.compose', defaultMessage: 'Compose' },
  notifications: {
    id: 'settings.sidebar_items.item.notifications',
    defaultMessage: 'Notifications',
  },
};

const itemHintsMessages = {
  context: {
    id: 'settings.sidebar_items.item.context.hint',
    defaultMessage: 'Panels related to the current page, like extended account information.',
  },
  announcements: {
    id: 'settings.sidebar_items.item.announcements.hint',
    defaultMessage: 'Announcements from the instance administration.',
  },
  recommendations: {
    id: 'settings.sidebar_items.item.recommendations.hint',
    defaultMessage: 'Recommended accounts, trending hashtags.',
  },
  promo: {
    id: 'settings.sidebar_items.item.promo.hint',
    defaultMessage: 'Links and content set by your instance administrators.',
  },
  footer: {
    id: 'settings.sidebar_items.item.footer.hint',
    defaultMessage: 'Project information, including version details.',
  },
  compose: { id: 'settings.sidebar_items.item.compose.hint', defaultMessage: 'Compose new posts.' },
  notifications: {
    id: 'settings.sidebar_items.item.notifications.hint',
    defaultMessage: 'Notifications about mentions and interactions with your posts.',
  },
};

const SidebarItem: StreamfieldComponent<(typeof AVAILABLE_SIDEBAR_ITEMS)[number]> = ({ value }) => {
  const intl = useIntl();

  return (
    <div className='⁂-interface-item'>
      <Icon className='⁂-interface-item__drag-handle' src={iconDotsSixVertical} aria-hidden />
      <div>
        <p>{intl.formatMessage(itemsMessages[value])}</p>
        <small>{intl.formatMessage(itemHintsMessages[value])}</small>
      </div>
    </div>
  );
};

const SidebarItems: React.FC = () => {
  const intl = useIntl();

  const settings = useSettings();

  const availableItems = AVAILABLE_SIDEBAR_ITEMS.filter(
    (item) => !settings.sidebarItems.includes(item),
  );

  return (
    <Column title={intl.formatMessage(messages.heading)}>
      <Form>
        <OutlineBox className='⁂-interface-items__explanation'>
          <FormattedMessage
            id='settings.sidebar_items.description'
            defaultMessage='You can decide what items are visible in your sidebar.'
          />
        </OutlineBox>

        <StreamfieldPicker
          className='⁂-interface-items'
          component={SidebarItem}
          values={settings.sidebarItems}
          availableValues={availableItems}
          getItemKey={(item) => item}
          onChange={(values) => changeSetting(['sidebarItems'], values)}
          availableTitle={
            <FormattedMessage
              id='settings.sidebar_items.available'
              defaultMessage='Available items'
            />
          }
        />
      </Form>
    </Column>
  );
};

export { SidebarItems as default };
