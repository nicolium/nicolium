import iconQrCode from '@phosphor-icons/core/regular/qr-code.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import CopyableInput from '@/components/copyable-input';
import Icon from '@/components/ui/icon';
import { useModalsActions } from '@/stores/modals';

import { getTitle } from '../utils/coin-db';

import CryptoIcon from './crypto-icon';

const messages = defineMessages({
  showQrCode: {
    id: 'crypto.show_qr_code',
    defaultMessage: 'Show QR code',
  },
});

interface ICryptoAddress {
  address: string;
  ticker: string;
  note?: string;
}

const CryptoAddress: React.FC<ICryptoAddress> = (props) => {
  const { address, ticker, note } = props;

  const intl = useIntl();
  const { openModal } = useModalsActions();

  const handleModalClick: React.MouseEventHandler<HTMLElement> = (e) => {
    openModal('CRYPTO_DONATE', props);
    e.preventDefault();
  };

  const title = getTitle(ticker);

  return (
    <div className='crypto-address'>
      <div className='crypto-address__label'>
        <CryptoIcon className='crypto-address__icon' ticker={ticker} title={title} />

        <p>{title || ticker.toUpperCase()}</p>

        <button
          onClick={handleModalClick}
          title={intl.formatMessage(messages.showQrCode)}
          aria-label={intl.formatMessage(messages.showQrCode)}
        >
          <Icon src={iconQrCode} size={20} aria-hidden />
        </button>
      </div>

      {note && <p>{note}</p>}

      <CopyableInput value={address} />
    </div>
  );
};

export { type ICryptoAddress, CryptoAddress as default };
