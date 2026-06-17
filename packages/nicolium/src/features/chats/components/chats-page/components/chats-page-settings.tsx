import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import { useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import List, { ListItem } from '@/components/list';
import { CardBody, CardTitle } from '@/components/ui/card';
import Form from '@/components/ui/form';
import IconButton from '@/components/ui/icon-button';
import Toggle from '@/components/ui/toggle';
import { useOwnAccount } from '@/hooks/use-own-account';
import SettingToggle from '@/pages/settings/components/setting-toggle';
import { useUpdateCredentials } from '@/queries/accounts/use-account-credentials';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';

type FormData = {
  accepts_chat_messages?: boolean;
};

const messages = defineMessages({
  title: { id: 'chat.page_settings.title', defaultMessage: 'Message settings' },
  preferences: { id: 'chat.page_settings.preferences', defaultMessage: 'Preferences' },
  privacy: { id: 'chat.page_settings.privacy', defaultMessage: 'Privacy' },
  acceptingMessageLabel: {
    id: 'chat.page_settings.accepting_messages.label',
    defaultMessage: 'Allow users to start a new chat with you',
  },
  playSoundsLabel: {
    id: 'chat.page_settings.play_sounds.label',
    defaultMessage: 'Play a sound when you receive a message',
  },
  submit: { id: 'chat.page_settings.submit', defaultMessage: 'Save' },
  success: {
    id: 'settings.messages.success',
    defaultMessage: 'Chat settings updated',
  },
  fail: { id: 'settings.messages.fail', defaultMessage: 'Failed to update chat settings' },
  back: { id: 'chats.back', defaultMessage: 'Back to chats' },
});

const ChatsPageSettings = () => {
  const { data: account } = useOwnAccount();
  const intl = useIntl();
  const navigate = useNavigate();
  const settings = useSettings();
  const updateCredentials = useUpdateCredentials();

  const [data, setData] = useState<FormData>({
    accepts_chat_messages: account?.accepts_chat_messages === true,
  });

  const onToggleChange = (key: string[], checked: boolean) => {
    changeSetting(key, checked, { showAlert: true });
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    updateCredentials.mutate(data, {
      onSuccess: () => {
        toast.success(messages.success);
      },
      onError: () => {
        toast.error(intl.formatMessage(messages.fail));
      },
    });
  };

  return (
    <div className='chats-page-panel chats-page-panel--settings'>
      <div className='chats-page-panel__title'>
        <IconButton
          src={iconArrowLeft}
          className='chats-page-panel__back-button'
          onClick={() => navigate({ to: '/chats' })}
          title={intl.formatMessage(messages.back)}
        />

        <CardTitle title={intl.formatMessage(messages.title)} />
      </div>

      <Form onSubmit={handleSubmit}>
        <CardTitle title={intl.formatMessage(messages.preferences)} />

        <List>
          <ListItem label={intl.formatMessage(messages.playSoundsLabel)}>
            <SettingToggle
              settings={settings}
              settingPath={['chats', 'sound']}
              onChange={onToggleChange}
            />
          </ListItem>
        </List>

        <CardTitle title={intl.formatMessage(messages.privacy)} />

        <CardBody>
          <List>
            <ListItem label={intl.formatMessage(messages.acceptingMessageLabel)}>
              <Toggle
                checked={data.accepts_chat_messages}
                onChange={(event) => {
                  setData((prevData) => ({
                    ...prevData,
                    accepts_chat_messages: event.target.checked,
                  }));
                }}
              />
            </ListItem>
          </List>
        </CardBody>

        <button
          className='chats-page-panel__submit'
          type='submit'
          disabled={updateCredentials.isPending}
        >
          {intl.formatMessage(messages.submit)}
        </button>
      </Form>
    </div>
  );
};

export { ChatsPageSettings as default };
