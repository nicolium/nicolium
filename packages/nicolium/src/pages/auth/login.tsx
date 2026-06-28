import { Link, Navigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchInstance } from '@/actions/instance';
import { BigCard } from '@/components/ui/big-card';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { useAuthActions } from '@/stores/auth';
import { useModalsActions } from '@/stores/modals';
import { getRedirectUrl } from '@/utils/redirect';
import { useIsStandalone } from '@/utils/state';

import ConsumersList from './components/consumers-list';
import LoginForm from './components/login-form';
import OtpAuthForm from './components/otp-auth-form';

import type { NicoliumResponse } from '@/api';

const LoginPage = () => {
  const { closeModal } = useModalsActions();
  const { logIn, verifyCredentials, switchAccount } = useAuthActions();

  const me = useCurrentAccount();
  const standalone = useIsStandalone();

  const token = new URLSearchParams(window.location.search).get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [mfaAuthNeeded, setMfaAuthNeeded] = useState(!!token);
  const [mfaToken, setMfaToken] = useState(token ?? '');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const getFormData = (form: HTMLFormElement) =>
    Object.fromEntries(Array.from(form).map((i: any) => [i.name, i.value]));

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    const { username, password } = getFormData(event.target);
    logIn(username, password)
      .then(({ access_token }) => verifyCredentials(access_token))
      // Refetch the instance for authenticated fetch
      .then(async (account) => {
        await fetchInstance();
        return account;
      })
      .then((account) => {
        closeModal();
        switchAccount(account);
        if (typeof me !== 'string') {
          setShouldRedirect(true);
        }
      })
      .catch((error: { response: NicoliumResponse }) => {
        const data: any = error.response?.json;
        if (data?.error === 'mfa_required') {
          setMfaAuthNeeded(true);
          setMfaToken(data.mfa_token);
        }
        setIsLoading(false);
      });
    setIsLoading(true);
    event.preventDefault();
  };

  if (standalone) return <Navigate to='/login/external' replace />;

  if (shouldRedirect) {
    const redirectUri = getRedirectUrl();
    return <Navigate to={redirectUri} replace />;
  }

  if (mfaAuthNeeded) return <OtpAuthForm mfa_token={mfaToken} />;

  return (
    <BigCard title={<FormattedMessage id='login_form.header' defaultMessage='Sign in' />}>
      <div className='login'>
        <LoginForm handleSubmit={handleSubmit} isLoading={isLoading} />
        <ConsumersList />

        <div className='login__divider'>
          <p>
            <FormattedMessage id='login_form.divider' defaultMessage='or' />
          </p>
        </div>

        <Link to='/login/external' className='login__external'>
          <FormattedMessage
            id='login_form.external'
            defaultMessage='Sign in from remote instance'
          />
        </Link>
      </div>
    </BigCard>
  );
};

export { LoginPage as default };
