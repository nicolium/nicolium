import React from 'react';
import { FormattedMessage } from 'react-intl';

import CopyableInput from '@/components/copyable-input';
import Emoji from '@/components/ui/emoji';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';

interface ILightningAddress {
  address: string;
}

const LightningAddress: React.FC<ILightningAddress> = (props): React.JSX.Element => {
  const { address } = props;

  return (
    <Stack>
      <HStack alignItems='center' className='mb-1'>
        <Emoji
          className='mr-2.5 flex w-6 items-start justify-center rtl:ml-2.5 rtl:mr-0'
          emoji='⚡'
        />

        <Text weight='bold'>
          <FormattedMessage id='crypto.lightning' defaultMessage='Lightning' />
        </Text>
      </HStack>

      <CopyableInput value={address} />
    </Stack>
  );
};

export { LightningAddress as default };
