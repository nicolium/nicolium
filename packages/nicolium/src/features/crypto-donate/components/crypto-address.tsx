import iconQrCode from '@phosphor-icons/core/regular/qr-code.svg';
import React from 'react';

import CopyableInput from '@/components/copyable-input';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import { useModalsActions } from '@/stores/modals';

import { getTitle } from '../utils/coin-db';

import CryptoIcon from './crypto-icon';

interface ICryptoAddress {
  address: string;
  ticker: string;
  note?: string;
}

const CryptoAddress: React.FC<ICryptoAddress> = (props): React.JSX.Element => {
  const { address, ticker, note } = props;

  const { openModal } = useModalsActions();

  const handleModalClick: React.MouseEventHandler<HTMLElement> = (e) => {
    openModal('CRYPTO_DONATE', props);
    e.preventDefault();
  };

  const title = getTitle(ticker);

  return (
    <div className='flex flex-col'>
      <div className='mb-1 flex items-center'>
        <CryptoIcon
          className='mr-2.5 flex w-6 items-start justify-center rtl:ml-2.5 rtl:mr-0'
          ticker={ticker}
          title={title}
        />

        <Text weight='bold'>{title || ticker.toUpperCase()}</Text>

        <div className='ml-auto flex items-center'>
          <a className='ml-1 text-gray-500 rtl:ml-0 rtl:mr-1' href='#' onClick={handleModalClick}>
            <Icon src={iconQrCode} size={20} />
          </a>
        </div>
      </div>

      {note && <Text>{note}</Text>}

      <CopyableInput value={address} />
    </div>
  );
};

export { type ICryptoAddress, CryptoAddress as default };
