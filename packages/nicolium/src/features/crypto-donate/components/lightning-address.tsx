import React from 'react';
import { FormattedMessage } from 'react-intl';

import CopyableInput from '@/components/copyable-input';
import Emoji from '@/components/ui/emoji';
import Text from '@/components/ui/text';

interface ILightningAddress {
  address: string;
}

const LightningAddress: React.FC<ILightningAddress> = ({ address }) => (
  <div className='flex flex-col'>
    <div className='mb-1 flex items-center'>
      <Emoji
        className='mr-2.5 flex w-6 items-start justify-center rtl:ml-2.5 rtl:mr-0'
        emoji='⚡'
      />

      <Text weight='bold'>
        <FormattedMessage id='crypto.lightning' defaultMessage='Lightning' />
      </Text>
    </div>

    <CopyableInput value={address} />
  </div>
);

export { LightningAddress as default };
