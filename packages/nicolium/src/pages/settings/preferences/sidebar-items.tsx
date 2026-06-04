import iconDotsSixVertical from '@phosphor-icons/core/regular/dots-six-vertical.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting as defaultChangeSetting } from '@/actions/settings';
import OutlineBox from '@/components/outline-box';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import Icon from '@/components/ui/icon';
import StreamfieldPicker from '@/components/ui/streamfield-picker';
import { useAccount } from '@/queries/accounts/use-account';
import { AVAILABLE_SIDEBAR_ITEMS, DEFAULT_SIDEBAR_ITEMS } from '@/schemas/frontend-settings';
import { useDefaultSettings, useSettings } from '@/stores/settings';
import { useShoutboxIsLoading } from '@/stores/shoutbox';
import toast from '@/toast';

import type { StreamfieldComponent } from '@/components/ui/streamfield';
import type { ISettingsPage } from '@/pages/dashboard/components/frontend-config/default-setings-wrapper';
import type { SidebarItem as SidebarItemType } from '@/schemas/frontend-settings';

const messages = defineMessages({
  heading: { id: 'settings.sidebar_items.heading', defaultMessage: 'Sidebar items' },
  resetSuccess: {
    id: 'settings.sidebar_items.reset.success',
    defaultMessage: 'Sidebar items reset to default',
  },
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
  shoutbox: {
    id: 'settings.sidebar_items.item.shoutbox',
    defaultMessage: 'Shoutbox',
  },
  account: {
    id: 'settings.sidebar_items.item.account',
    defaultMessage: 'Account',
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
  shoutbox: {
    id: 'settings.sidebar_items.item.shoutbox.hint',
    defaultMessage: 'Instance-wide real-time chat.',
  },
  account: {
    id: 'settings.sidebar_items.item.account.hint',
    defaultMessage: "Shows the account's latest post.",
  },
};

const isAccountSidebarItem = (item: SidebarItemType): item is `account:${string}` =>
  item.startsWith('account:');

const SidebarItem: StreamfieldComponent<SidebarItemType> = ({ value }) => {
  const intl = useIntl();
  const { data: account } = useAccount(isAccountSidebarItem(value) ? value.slice(8) : undefined);
  const itemKey = isAccountSidebarItem(value) ? 'account' : value;

  return (
    <div className='interface-item'>
      <Icon className='interface-item__drag-handle' src={iconDotsSixVertical} aria-hidden />
      <div>
        <p>
          {isAccountSidebarItem(value) && account
            ? `@${account.acct}`
            : intl.formatMessage(itemsMessages[itemKey])}
        </p>
        <small>{intl.formatMessage(itemHintsMessages[itemKey])}</small>
      </div>
    </div>
  );
};

const SidebarItems: React.FC<ISettingsPage> = ({
  changeSetting = defaultChangeSetting,
  settings: settingsProp,
  onSave,
  disabled,
}) => {
  const intl = useIntl();
  const defaultSettings = useDefaultSettings();

  const showShoutbox = !useShoutboxIsLoading();

  const userSettings = useSettings();
  const settings = settingsProp || userSettings;

  const availableItems = AVAILABLE_SIDEBAR_ITEMS.filter(
    (item) => !settings.sidebarItems.includes(item) && (item !== 'shoutbox' || showShoutbox),
  );

  const reset = () => {
    changeSetting(['sidebarItems'], onSave ? DEFAULT_SIDEBAR_ITEMS : defaultSettings.sidebarItems);
    toast.success(messages.resetSuccess);
  };

  return (
    <Column title={intl.formatMessage(messages.heading)}>
      <Form>
        <OutlineBox className='interface-items__explanation'>
          <FormattedMessage
            id='settings.sidebar_items.description'
            defaultMessage='You can decide what items are visible in your sidebar.'
          />
        </OutlineBox>

        <StreamfieldPicker
          className='interface-items'
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

        <div className='form__actions interface-items__actions'>
          <button type='button' onClick={reset}>
            <FormattedMessage id='settings.interface_items.reset' defaultMessage='Reset' />
          </button>

          {onSave && (
            <button type='submit' disabled={disabled} onClick={onSave}>
              <FormattedMessage id='common.save' defaultMessage='Save' />
            </button>
          )}
        </div>
      </Form>
    </Column>
  );
};

export { SidebarItems as default };
