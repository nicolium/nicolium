import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Toggle from '@/components/ui/toggle';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useUpdateCredentials } from '@/queries/accounts/use-account-credentials';
import toast from '@/toast';

const messages = defineMessages({
  label: {
    id: 'settings.messages.label',
    defaultMessage: 'Allow users to start a new chat with you',
  },
  success: {
    id: 'settings.messages.success',
    defaultMessage: 'Chat settings updated successfully',
  },
  fail: { id: 'settings.messages.fail', defaultMessage: 'Failed to update chat settings' },
});

const MessagesSettings = () => {
  const { account } = useOwnAccount();
  const intl = useIntl();
  const updateCredentials = useUpdateCredentials();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateCredentials.mutate(
      { accepts_chat_messages: event.target.checked },
      {
        onSuccess: () => {
          toast.success(intl.formatMessage(messages.success));
        },
        onError: () => {
          toast.error(intl.formatMessage(messages.fail));
        },
      },
    );
  };

  if (!account) {
    return null;
  }

  return (
    <List>
      <ListItem label={intl.formatMessage(messages.label)}>
        <Toggle checked={account.accepts_chat_messages ?? false} onChange={handleChange} />
      </ListItem>
    </List>
  );
};

export { MessagesSettings as default };
