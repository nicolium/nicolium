import { Navigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { logIn, verifyCredentials, switchAccount } from '@/actions/auth';
import { fetchInstance } from '@/actions/instance';
import { BigCard } from '@/components/big-card';
import Button from '@/components/ui/button';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import ConsumersList from '@/features/auth-login/components/consumers-list';
import LoginForm from '@/features/auth-login/components/login-form';
import OtpAuthForm from '@/features/auth-login/components/otp-auth-form';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useModalsActions } from '@/stores/modals';
import { getRedirectUrl } from '@/utils/redirect';
import { isStandalone } from '@/utils/state';

import type { PlfeResponse } from '@/api';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const { closeModal } = useModalsActions();

  const me = useAppSelector((state) => state.me);
  const standalone = useAppSelector((state) => isStandalone(state));

  const token = new URLSearchParams(window.location.search).get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [mfaAuthNeeded, setMfaAuthNeeded] = useState(!!token);
  const [mfaToken, setMfaToken] = useState(token ?? '');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const getFormData = (form: HTMLFormElement) =>
    Object.fromEntries(Array.from(form).map((i: any) => [i.name, i.value]));

  const handleSubmit: React.FormEventHandler = (event) => {
    const { username, password } = getFormData(event.target as HTMLFormElement);
    dispatch(logIn(username, password))
      .then(({ access_token }) => dispatch(verifyCredentials(access_token)))
      // Refetch the instance for authenticated fetch
      .then(async (account) => {
        await dispatch(fetchInstance());
        return account;
      })
      .then((account: { id: string }) => {
        closeModal();
        if (typeof me === 'string') {
          dispatch(switchAccount(account.id));
        } else {
          setShouldRedirect(true);
        }
      })
      .catch((error: { response: PlfeResponse }) => {
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
      <Stack space={4}>
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
      </Stack>
    </BigCard>
  );
};

export { LoginPage as default };
