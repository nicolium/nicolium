import { useNavigate } from '@tanstack/react-router';
import React, { useState, useCallback } from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Text from '@/components/ui/text';
import { useFeatures } from '@/hooks/use-features';
import { useDisableMfa } from '@/queries/security/use-mfa';
import toast from '@/toast';

const messages = defineMessages({
  disableFail: { id: 'mfa.disable.fail', defaultMessage: 'Incorrect password. Try again.' },
  mfaDisableSuccess: { id: 'mfa.disable.success', defaultMessage: 'MFA disabled' },
  codePlaceholder: { id: 'mfa.mfa_setup.code.placeholder', defaultMessage: 'Code' },
  passwordPlaceholder: { id: 'mfa.mfa_setup.password.placeholder', defaultMessage: 'Password' },
});

const DisableOtpForm: React.FC = () => {
  const [password, setPassword] = useState('');

  const features = useFeatures();
  const intl = useIntl();
  const navigate = useNavigate();

  const { mutate: disableMfa, isPending } = useDisableMfa();

  const handleSubmit = useCallback(() => {
    disableMfa(password, {
      onSuccess: () => {
        toast.success(messages.mfaDisableSuccess);
        navigate({ to: '/settings/security' });
      },
      onError: () => {
        toast.error(intl.formatMessage(messages.disableFail));
      },
    });
  }, [password, intl]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className='flex flex-col'>
        <Text weight='medium'>
          <FormattedMessage id='mfa.otp_enabled.title' defaultMessage='OTP enabled' />
        </Text>

        <Text theme='muted'>
          <FormattedMessage
            id='mfa.otp_enabled.description'
            defaultMessage='You have enabled two-factor authentication via OTP.'
          />
        </Text>
      </div>

      {features.disableMfaWithCode ? (
        <FormGroup
          labelText={<FormattedMessage id='mfa.mfa_setup.code.placeholder' defaultMessage='Code' />}
          hintText={
            <FormattedMessage
              id='mfa.mfa_disable_enter_code'
              defaultMessage='Enter the code from your two-factor app to disable two-factor auth.'
            />
          }
        >
          <Input
            name='code'
            placeholder={intl.formatMessage(messages.codePlaceholder)}
            onChange={handleInputChange}
            autoComplete='one-time-code'
            disabled={isPending}
            value={password}
            type='text'
            required
          />
        </FormGroup>
      ) : (
        <FormGroup
          labelText={
            <FormattedMessage id='mfa.mfa_setup.password.placeholder' defaultMessage='Password' />
          }
          hintText={
            <FormattedMessage
              id='mfa.mfa_disable_enter_password'
              defaultMessage='Enter your current password to disable two-factor auth.'
            />
          }
        >
          <Input
            type='password'
            placeholder={intl.formatMessage(messages.passwordPlaceholder)}
            name='password'
            onChange={handleInputChange}
            disabled={isPending}
            value={password}
            required
          />
        </FormGroup>
      )}

      <FormActions>
        <Button
          disabled={isPending}
          theme='danger'
          type='submit'
          text={<FormattedMessage id='column.mfa_disable_button' defaultMessage='Disable' />}
        />
      </FormActions>
    </Form>
  );
};

export { DisableOtpForm as default };
