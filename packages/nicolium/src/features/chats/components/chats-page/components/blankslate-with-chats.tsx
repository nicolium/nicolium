import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button';
import Text from '@/components/ui/text';

/** To display on the chats main page when no message is selected, but chats are present. */
const BlankslateWithChats = () => {
  const navigate = useNavigate();

  const handleNewChat = () => {
    navigate({ to: '/chats/new' });
  };

  return (
    <div className='flex h-full flex-col items-center justify-center gap-6 p-6'>
      <div className='flex max-w-sm flex-col gap-2'>
        <Text size='2xl' weight='bold' tag='h2' align='center'>
          <FormattedMessage
            id='chats.main.blankslate_with_chats.title'
            defaultMessage='Select a chat'
          />
        </Text>

        <Text size='sm' theme='muted' align='center'>
          <FormattedMessage
            id='chats.main.blankslate_with_chats.subtitle'
            defaultMessage='Select from one of your open chats or create a new message.'
          />
        </Text>
      </div>

      <Button theme='primary' onClick={handleNewChat}>
        <FormattedMessage id='chats.main.blankslate.new_chat' defaultMessage='Message someone' />
      </Button>
    </div>
  );
};

export { BlankslateWithChats as default };
