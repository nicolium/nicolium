import { Link, Navigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchInstance } from '@/actions/instance';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { useRegistrationStatus } from '@/hooks/use-registration-status';
import ExternalLoginForm from '@/pages/auth/components/external-login-form';
import LoginForm from '@/pages/auth/components/login-form';
import OtpAuthForm from '@/pages/auth/components/otp-auth-form';
import { useAuthActions } from '@/stores/auth';
import { useInstance } from '@/stores/instance';
import { getRedirectUrl } from '@/utils/redirect';
import { useIsStandalone } from '@/utils/state';

import type { NicoliumResponse } from '@/api';

const SignUpPanel = () => {
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();
  const me = useCurrentAccount();
  const standalone = useIsStandalone();
  const { logIn, switchAccount, verifyCredentials } = useAuthActions();

  const token = new URLSearchParams(window.location.search).get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [mfaAuthNeeded, setMfaAuthNeeded] = useState(!!token);
  const [mfaToken, setMfaToken] = useState(token ?? '');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const getFormData = (form: HTMLFormElement) =>
    Object.fromEntries(
      Array.from(form).map((i) => [(i as HTMLInputElement).name, (i as HTMLInputElement).value]),
    );

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

  if (shouldRedirect) {
    const redirectUri = getRedirectUrl();
    return <Navigate to={redirectUri} />;
  }

  if (mfaAuthNeeded) return <OtpAuthForm mfa_token={mfaToken} small />;

  if (me) return null;

  return (
    <div className='sign-up-panel' data-testid='sign-up-panel'>
      {isOpen && (
        <>
          <div className='sign-up-panel__registration'>
            <h2>
              <FormattedMessage
                id='signup_panel.title'
                defaultMessage='New to {site_title}?'
                values={{ site_title: instance.title }}
              />
            </h2>

            <p>
              <FormattedMessage
                id='signup_panel.subtitle'
                defaultMessage='Sign up now to discuss what’s happening.'
              />
            </p>
          </div>

          <Link className='sign-up-panel__link' to='/signup'>
            <FormattedMessage id='account.register' defaultMessage='Sign up' />
          </Link>
        </>
      )}

      {standalone ? (
        <>
          <h2 className='sign-up-panel__heading'>
            <FormattedMessage
              id='signup_panel.sign_in.title.external'
              defaultMessage='Sign in to external instance'
            />
          </h2>
          <ExternalLoginForm />
        </>
      ) : (
        <>
          <h2 className='sign-up-panel__heading'>
            {isOpen ? (
              <FormattedMessage
                id='signup_panel.sign_in.title.or'
                defaultMessage='Already have an account?'
              />
            ) : (
              <FormattedMessage id='signup_panel.sign_in.title' defaultMessage='Sign in' />
            )}
          </h2>

          <LoginForm handleSubmit={handleSubmit} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

export { SignUpPanel as default };
