import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Avatar from '@/components/ui/avatar';
import IconButton from '@/components/ui/icon-button';
import Text from '@/components/ui/text';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useInstance } from '@/stores/instance';

import Shoutbox from '../../shoutbox';

const messages = defineMessages({
  back: { id: 'chats.back', defaultMessage: 'Back to chats' },
});

const ChatsPageShoutbox = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const instance = useInstance();
  const { logo } = useFrontendConfig();

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='flex w-full items-center gap-2 overflow-hidden p-4'>
        <div className='flex items-center'>
          <IconButton
            src={iconArrowLeft}
            className='mr-2 size-7 sm:mr-0 sm:hidden rtl:rotate-180'
            onClick={() => navigate({ to: '/chats' })}
            title={intl.formatMessage(messages.back)}
          />

          <Avatar src={logo} alt='' size={40} className='flex-none' />
        </div>

        <div className='flex h-11 flex-col items-start overflow-hidden'>
          <div className='flex w-full grow items-center space-x-1'>
            <Text weight='bold' size='sm' align='left' truncate>
              <FormattedMessage
                id='chat_list_item_shoutbox'
                defaultMessage='{instance} shoutbox'
                values={{ instance: instance.title }}
              />
            </Text>
          </div>
        </div>
      </div>

      <div className='h-full overflow-hidden'>
        <Shoutbox className='h-full' />
      </div>
    </div>
  );
};

export { ChatsPageShoutbox as default };
