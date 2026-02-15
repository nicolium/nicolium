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
}): JSX.Element => {
  const title = getTitle(ticker);

  return (
    <div className='flex flex-col'>
      <div className='mb-1.5 flex items-center'>
        <CryptoIcon
          className='mr-2.5 flex w-6 items-start justify-center'
          imgClassName='w-full'
          ticker={ticker}
          title={title}
        />
        <div className='font-bold'>{title || ticker.toUpperCase()}</div>
      </div>
      {note && <div className='mb-2.5'>{note}</div>}
      <div className='mb-3 flex items-center justify-center p-2.5'>
        <QRCode className='rounded-lg' value={address} includeMargin />
      </div>

      <CopyableInput value={address} />
    </div>
  );
};

export { DetailedCryptoAddress as default };
