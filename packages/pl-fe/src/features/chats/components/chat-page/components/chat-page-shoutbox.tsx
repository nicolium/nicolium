import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';

import Shoutbox from '../../shoutbox';

const ChatPageShoutbox = () => {
  const navigate = useNavigate();
  const instance = useInstance();
  const { logo } = usePlFeConfig();

  return (
    <Stack className='h-full overflow-hidden'>
      <HStack alignItems='center' justifyContent='between' space={2} className='w-full p-4'>
        <HStack alignItems='center' space={2} className='overflow-hidden'>
          <HStack alignItems='center'>
            <IconButton
              src={require('@phosphor-icons/core/regular/arrow-left.svg')}
              className='mr-2 size-7 sm:mr-0 sm:hidden rtl:rotate-180'
              onClick={() => navigate({ to: '/chats' })}
            />

            <Avatar src={logo} alt='' size={40} className='flex-none' />
          </HStack>

          <Stack alignItems='start' className='h-11 overflow-hidden'>
            <div className='flex w-full grow items-center space-x-1'>
              <Text weight='bold' size='sm' align='left' truncate>
                <FormattedMessage id='chat_list_item_shoutbox' defaultMessage='{instance} shoutbox' values={{ instance: instance.title }} />
              </Text>
            </div>
          </Stack>
        </HStack>
      </HStack>

      <div className='h-full overflow-hidden'>
        <Shoutbox className='h-full' />
      </div>
    </Stack>
  );
};

export { ChatPageShoutbox as default };
