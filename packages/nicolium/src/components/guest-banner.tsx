import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';
import { FormattedMessage, useIntl, defineMessages } from 'react-intl';

import Icon from '@/components/ui/icon';
import { useAuthActions, useGuestUrl } from '@/stores/auth';
import { getInstanceHost, useInstance } from '@/stores/instance';

const messages = defineMessages({
  dismiss: { id: 'guest_banner.dismiss', defaultMessage: 'Stop viewing' },
});

const GuestBanner: React.FC = () => {
  const intl = useIntl();
  const guestUrl = useGuestUrl();
  const instance = useInstance();
  const { exitGuest } = useAuthActions();

  if (!guestUrl) return null;

  const name = instance.title || getInstanceHost(guestUrl);

  const handleDismiss = () => {
    exitGuest();
    window.location.href = '/login/external';
  };

  return (
    <div className='guest-banner'>
      <p className='guest-banner__label'>
        <FormattedMessage
          id='guest_banner.viewing'
          defaultMessage='Browsing {instance}'
          values={{ instance: <strong>{name}</strong> }}
        />
      </p>
      <button
        type='button'
        className='guest-banner__dismiss'
        onClick={handleDismiss}
        aria-label={intl.formatMessage(messages.dismiss)}
        title={intl.formatMessage(messages.dismiss)}
      >
        <Icon src={iconX} />
      </button>
    </div>
  );
};

export { GuestBanner as default };
