import React from 'react';
import { FormattedMessage } from 'react-intl';

import CopyableInput from '@/components/copyable-input';
import Emoji from '@/components/ui/emoji';

interface ILightningAddress {
  address: string;
}

const LightningAddress: React.FC<ILightningAddress> = ({ address }) => (
  <div className='⁂-crypto-address'>
    <div className='⁂-crypto-address__label'>
      <Emoji className='⁂-crypto-address__icon' emoji='⚡' />

      <p>
        <FormattedMessage id='crypto.lightning' defaultMessage='Lightning' />
      </p>
    </div>

    <CopyableInput value={address} />
  </div>
);

export { LightningAddress as default };
