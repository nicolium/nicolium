import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import * as BuildConfig from '@/build-config';
import { handleExternalLogin } from '@/pages/auth/components/external-login-form';

interface IDeckColumnLoginRequired {
  accountUrl: string;
}

const DeckColumnLoginRequired: React.FC<IDeckColumnLoginRequired> = ({ accountUrl }) => {
  const backendUrl = BuildConfig.BACKEND_URL || window.location.origin;

  const isLocal = new URL(accountUrl).origin === backendUrl;

  const handleAuthorizationCodeAuth = () => {
    handleExternalLogin(new URL(accountUrl).origin, false);
  };

  return (
    <div className='deck__column__content'>
      <p>
        <FormattedMessage
          id='column.deck.login_required'
          defaultMessage='You need to log in to {accountUrl} to view this column.'
          values={{ accountUrl: <strong>{accountUrl}</strong> }}
        />
      </p>
      {isLocal ? (
        <Link to='/login/add'>
          <FormattedMessage id='column.deck.login_required.log_in' defaultMessage='Log in' />
        </Link>
      ) : (
        <button onClick={handleAuthorizationCodeAuth}>
          <FormattedMessage id='column.deck.login_required.log_in' defaultMessage='Log in' />
        </button>
      )}
    </div>
  );
};

export { DeckColumnLoginRequired };
