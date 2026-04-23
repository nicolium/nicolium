import React from 'react';

import { useFrontendConfig } from '@/hooks/use-frontend-config';

import CryptoAddress from './crypto-address';

interface ISiteWallet {
  limit?: number;
}

const SiteWallet: React.FC<ISiteWallet> = ({ limit }): React.JSX.Element => {
  const { cryptoAddresses } = useFrontendConfig();
  const addresses = typeof limit === 'number' ? cryptoAddresses.slice(0, limit) : cryptoAddresses;

  return (
    <div className='flex flex-col gap-4'>
      {addresses.map((address) => (
        <CryptoAddress
          key={address.ticker}
          address={address.address}
          ticker={address.ticker}
          note={address.note}
        />
      ))}
    </div>
  );
};

export { SiteWallet as default };
