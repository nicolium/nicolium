import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Avatar from '@/components/ui/avatar';
import HStack from '@/components/ui/hstack';
import IconButton from '@/components/ui/icon-button';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useInstance } from '@/hooks/use-instance';

import Shoutbox from '../../shoutbox';

const ChatsPageShoutbox = () => {
  const navigate = useNavigate();
  const instance = useInstance();
  const { logo } = useFrontendConfig();

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

export { ChatsPageShoutbox as default };
