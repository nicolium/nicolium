import { QRCodeCanvas as QRCode } from 'qrcode.react';
import React from 'react';

import CopyableInput from '@/components/copyable-input';

import { getTitle } from '../utils/coin-db';

import CryptoIcon from './crypto-icon';

interface IDetailedCryptoAddress {
  address: string;
  ticker: string;
  note?: string;
}

const DetailedCryptoAddress: React.FC<IDetailedCryptoAddress> = ({
  address,
  ticker,
  note,
}): React.JSX.Element => {
  const title = getTitle(ticker);

  return (
    <div className='detailed-crypto-address'>
      <div className='detailed-crypto-address__label'>
        <CryptoIcon
          className='detailed-crypto-address__icon'
          imgClassName='w-full'
          ticker={ticker}
          title={title}
        />
        <div>{title || ticker.toUpperCase()}</div>
      </div>
      {note && <div className='detailed-crypto-address__note'>{note}</div>}
      <div className='detailed-crypto-address__qr'>
        <QRCode value={address} includeMargin />
      </div>

      <CopyableInput value={address} />
    </div>
  );
};

export { DetailedCryptoAddress as default };
