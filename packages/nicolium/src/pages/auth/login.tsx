import { Navigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchInstance } from '@/actions/instance';
import { BigCard } from '@/components/ui/big-card';
import Button from '@/components/ui/button';
import Text from '@/components/ui/text';
import { useCurrentAccount } from '@/contexts/current-account-context';
import ConsumersList from '@/features/auth-login/components/consumers-list';
import LoginForm from '@/features/auth-login/components/login-form';
import OtpAuthForm from '@/features/auth-login/components/otp-auth-form';
import { useAuthActions } from '@/stores/auth';
import { useModalsActions } from '@/stores/modals';
import { getRedirectUrl } from '@/utils/redirect';
import { useIsStandalone } from '@/utils/state';

import type { NicoliumResponse } from '@/api';

const LoginPage = () => {
  const { closeModal } = useModalsActions();
  const { logIn, verifyCredentials, switchAccountById } = useAuthActions();

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
      .then((account: { id: string }) => {
        closeModal();
        switchAccountById(account.id);
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
      <div className='flex flex-col gap-4'>
        <LoginForm handleSubmit={handleSubmit} isLoading={isLoading} />
        <ConsumersList />

        <div
          className={
            "flex items-center gap-2.5 before:flex-1 before:border-b before:border-gray-300 before:content-[''] after:flex-1 after:border-b after:border-gray-300 after:content-[''] before:dark:border-gray-800 after:dark:border-gray-800"
          }
        >
          <Text align='center'>
            <FormattedMessage id='login_form.divider' defaultMessage='or' />
          </Text>
        </div>

        <Button className='w-full' theme='secondary' to='/login/external'>
          <FormattedMessage
            id='login_form.external'
            defaultMessage='Sign in from remote instance'
          />
        </Button>
      </div>
    </BigCard>
  );
};

export { LoginPage as default };
