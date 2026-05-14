import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import Input from '@/components/ui/input';

import type { StreamfieldComponent } from '@/components/ui/streamfield';
import type { CryptoAddress } from '@/schemas/frontend-config';

const messages = defineMessages({
  ticker: {
    id: 'frontend_config.crypto_address.meta_fields.ticker.placeholder',
    defaultMessage: 'Ticker',
  },
  address: {
    id: 'frontend_config.crypto_address.meta_fields.address.placeholder',
    defaultMessage: 'Address',
  },
  note: {
    id: 'frontend_config.crypto_address.meta_fields.note.placeholder',
    defaultMessage: 'Note (optional)',
  },
});

const CryptoAddressInput: StreamfieldComponent<CryptoAddress> = ({ value, onChange }) => {
  const intl = useIntl();

  const handleChange =
    (key: 'ticker' | 'address' | 'note'): React.ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      onChange({ ...value, [key]: e.currentTarget.value });
    };

  return (
    <div className='grid grow grid-cols-6 gap-2'>
      <Input
        type='text'
        outerClassName='col-span-1 grow'
        value={value.ticker}
        onChange={handleChange('ticker')}
        placeholder={intl.formatMessage(messages.ticker)}
      />
      <Input
        type='text'
        outerClassName='col-span-3 grow'
        value={value.address}
        onChange={handleChange('address')}
        placeholder={intl.formatMessage(messages.address)}
      />
      <Input
        type='text'
        outerClassName='col-span-2 grow'
        value={value.note}
        onChange={handleChange('note')}
        placeholder={intl.formatMessage(messages.note)}
      />
    </div>
  );
};

export { CryptoAddressInput as default };
