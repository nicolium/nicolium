import React from 'react';
import { FormattedMessage } from 'react-intl';

import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';

const Blankslate = () => (
  <Stack justifyContent='center' alignItems='center' space={2} className='mx-auto h-full w-2/3'>
    <Text weight='bold' size='lg' align='center'>
      <FormattedMessage id='chat_search.blankslate.title' defaultMessage='Start a chat' />
    </Text>
    <Text theme='muted' align='center'>
      <FormattedMessage
        id='chat_search.blankslate.body'
        defaultMessage='Search for someone to chat with.'
      />
    </Text>
  </Stack>
);

export { Blankslate as default };
