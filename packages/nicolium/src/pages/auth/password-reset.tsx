import { Navigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { resetPassword } from '@/actions/security';
import { BigCard } from '@/components/ui/big-card';
import Button from '@/components/ui/button';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import toast from '@/toast';

const messages = defineMessages({
  confirmation: {
    id: 'password_reset.confirmation',
    defaultMessage: 'Check your e-mail for confirmation.',
  },
});

const PasswordResetPage = () => {
  const intl = useIntl();
  const client = useClient();
  const features = useFeatures();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    const nicknameOrEmail = e.target.nickname_or_email.value;
    setIsLoading(true);
    resetPassword(client, nicknameOrEmail)
      .then(() => {
        setIsLoading(false);
        setSuccess(true);
        toast.info(intl.formatMessage(messages.confirmation));
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  if (success) return <Navigate to='/' replace />;

  return (
    <BigCard
      title={<FormattedMessage id='password_reset.header' defaultMessage='Reset password' />}
    >
      <Form onSubmit={handleSubmit}>
        <FormGroup
          labelText={
            features.logInWithUsername ? (
              <FormattedMessage
                id='password_reset.fields.username_placeholder'
                defaultMessage='E-mail or username'
              />
            ) : (
              <FormattedMessage
                id='password_reset.fields.email_placeholder'
                defaultMessage='E-mail address'
              />
            )
          }
        >
          <Input type='text' name='nickname_or_email' placeholder='me@example.com' required />
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
