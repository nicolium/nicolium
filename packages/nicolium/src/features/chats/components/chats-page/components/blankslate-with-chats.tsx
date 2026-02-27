import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';

/** To display on the chats main page when no message is selected, but chats are present. */
const BlankslateWithChats = () => {
  const navigate = useNavigate();

  const handleNewChat = () => {
    navigate({ to: '/chats/new' });
  };

  return (
    <Stack space={6} alignItems='center' justifyContent='center' className='h-full p-6'>
      <Stack space={2} className='max-w-sm'>
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
      </Stack>

      <Button theme='primary' onClick={handleNewChat}>
        <FormattedMessage id='chats.main.blankslate.new_chat' defaultMessage='Message someone' />
      </Button>
    </Stack>
  );
};

export { BlankslateWithChats as default };
