import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button';
import Text from '@/components/ui/text';

/** To display on the chats main page when no message is selected. */
const BlankslateEmpty: React.FC = () => (
  <div className='flex h-full flex-col items-center justify-center gap-6 p-6'>
    <div className='flex max-w-sm flex-col gap-2'>
      <Text size='2xl' weight='bold' tag='h2' align='center'>
        <FormattedMessage id='chats.main.blankslate.title' defaultMessage='No messages yet' />
      </Text>

      <Text size='sm' theme='muted' align='center'>
        <FormattedMessage
          id='chats.main.blankslate.subtitle'
          defaultMessage='Search for someone to chat with'
        />
      </Text>
    </div>

    <Button theme='primary' to='/chats/new'>
      <FormattedMessage id='chats.main.blankslate.new_chat' defaultMessage='Message someone' />
    </Button>
  </div>
);

export { BlankslateEmpty as default };
