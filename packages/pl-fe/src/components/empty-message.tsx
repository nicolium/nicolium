import React from 'react';

import Icon from './ui/icon';
import Stack from './ui/stack';
import Text from './ui/text';

interface IEmptyMessage {
  text: React.ReactNode;
  icon?: string;
}

const EmptyMessage: React.FC<IEmptyMessage> = ({ text, icon = require('@phosphor-icons/core/regular/empty.svg') }) => (
  <Stack space={4} className='⁂-empty-message py-6' justifyContent='center' alignItems='center'>
    <div className='rounded-full bg-gray-200 p-4 dark:bg-gray-800'>
      <Icon src={icon} className='size-6 text-gray-600' />
    </div>

    <Text theme='muted' align='center'>
      {text}
    </Text>
  </Stack>
);

export { EmptyMessage };
