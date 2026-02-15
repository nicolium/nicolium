import { Navigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { resetPassword } from '@/actions/security';
import { BigCard } from '@/components/big-card';
import Button from '@/components/ui/button';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useFeatures } from '@/hooks/use-features';
import toast from '@/toast';

const messages = defineMessages({
  nicknameOrEmail: { id: 'password_reset.fields.username_placeholder', defaultMessage: 'Email or username' },
  email: { id: 'password_reset.fields.email_placeholder', defaultMessage: 'E-mail address' },
  confirmation: { id: 'password_reset.confirmation', defaultMessage: 'Check your email for confirmation.' },
});

const PasswordResetPage = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    const nicknameOrEmail = (e.target as any).nickname_or_email.value;
    setIsLoading(true);
    dispatch(resetPassword(nicknameOrEmail)).then(() => {
      setIsLoading(false);
      setSuccess(true);
      toast.info(intl.formatMessage(messages.confirmation));
    }).catch(() => {
      setIsLoading(false);
    });
  };

  if (success) return <Navigate to='/' replace />;

  return (
    <BigCard title={<FormattedMessage id='password_reset.header' defaultMessage='Reset password' />}>
      <Form onSubmit={handleSubmit}>
        <FormGroup labelText={intl.formatMessage(features.logInWithUsername ? messages.nicknameOrEmail : messages.email)}>
          <Input
            type='text'
            name='nickname_or_email'
            placeholder='me@example.com'
            required
          />
        </FormGroup>

        <FormActions>
          <Button type='submit' theme='primary' disabled={isLoading}>
            <FormattedMessage id='password_reset.reset' defaultMessage='Reset password' />
          </Button>
        </FormActions>
      </Form>
    </BigCard>
  );
};

export { PasswordResetPage as default };
