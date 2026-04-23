import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import List, { ListItem } from '@/components/list';
import Toggle from '@/components/ui/toggle';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useUpdateCredentials } from '@/queries/accounts/use-account-credentials';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';

import SettingToggle from './setting-toggle';

const messages = defineMessages({
  success: {
    id: 'settings.messages.success',
    defaultMessage: 'Chat settings updated successfully',
  },
  fail: { id: 'settings.messages.fail', defaultMessage: 'Failed to update chat settings' },
});

const MessagesSettings = () => {
  const { data: account } = useOwnAccount();
  const intl = useIntl();
  const updateCredentials = useUpdateCredentials();
  const settings = useSettings();

  const handleChangeAcceptsChatMessages = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateCredentials.mutate(
      { accepts_chat_messages: event.target.checked },
      {
        onSuccess: () => {
          toast.success(messages.success);
        },
        onError: () => {
          toast.error(intl.formatMessage(messages.fail));
        },
      },
    );
  };

  const onToggleChange = (key: string[], checked: boolean) => {
    changeSetting(key, checked);
  };

  if (!account) {
    return null;
  }

  return (
    <List>
      <ListItem
        label={
          <FormattedMessage
            id='chat.page_settings.accepting_messages.label'
            defaultMessage='Allow users to start a new chat with you'
          />
        }
      >
        <Toggle
          checked={account.accepts_chat_messages ?? false}
          onChange={handleChangeAcceptsChatMessages}
        />
      </ListItem>
      <ListItem
        label={
          <FormattedMessage
            id='settings.messages.show_chat_widget.label'
            defaultMessage='Show chat widget'
          />
        }
        hint={
          <FormattedMessage
            id='settings.messages.show_chat_widget.hint'
            defaultMessage='Show the chat widget in the bottom right corner. If disabled, you can still use chats on a separate page.'
          />
        }
      >
        <SettingToggle
          settings={settings}
          settingPath={['showChatWidget']}
          defaultValue
          onChange={onToggleChange}
        />
      </ListItem>
    </List>
  );
};

export { MessagesSettings as default };
