import React from 'react';
import { FormattedMessage } from 'react-intl';

import Text from '@/components/ui/text';

const Blankslate = () => (
  <div className='mx-auto flex h-full w-2/3 flex-col items-center justify-center gap-2'>
    <Text weight='bold' size='lg' align='center'>
      <FormattedMessage id='chat_search.blankslate.title' defaultMessage='Start a chat' />
    </Text>
    <Text theme='muted' align='center'>
      <FormattedMessage
        id='chat_search.blankslate.body'
        defaultMessage='Search for someone to chat with.'
      />
    </Text>
  </div>
);

export { Blankslate as default };
