import { useNavigate } from '@tanstack/react-router';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import React, { useCallback, useEffect, useState } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';

import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import ColumnLoading from '@/features/ui/components/column-loading';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useConfirmMfa } from '@/queries/security/use-mfa';
import toast from '@/toast';

const messages = defineMessages({
  confirmFail: {
    id: 'security.confirm.fail',
    defaultMessage: 'Incorrect code or password. Try again.',
  },
  qrFail: { id: 'security.qr.fail', defaultMessage: 'Failed to fetch setup key' },
  mfaConfirmSuccess: { id: 'mfa.confirm.success', defaultMessage: 'MFA confirmed' },
  codePlaceholder: { id: 'mfa.mfa_setup.code.placeholder', defaultMessage: 'Code' },
  passwordPlaceholder: { id: 'mfa.mfa_setup.password.placeholder', defaultMessage: 'Password' },
});

const OtpConfirmForm: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const features = useFeatures();
  const client = useClient();

  const { mutate: confirmMfa, isPending } = useConfirmMfa();

  const [state, setState] = useState<{
    password: string;
    code: string;
    qrCodeURI: string;
    confirmKey: string;
  }>({
    password: '',
    code: '',
    qrCodeURI: '',
    confirmKey: '',
  });

  useEffect(() => {
    client.settings.mfa
      .getMfaSetup('totp')
      .then((data) => {
        setState((prevState) => ({
          ...prevState,
          qrCodeURI: data.provisioning_uri,
          confirmKey: data.key,
        }));
      })
      .catch(() => {
        toast.error(intl.formatMessage(messages.qrFail));
      });
  }, []);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    event.persist();

    setState((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  }, []);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    setState((prevState) => ({ ...prevState, isLoading: true }));

    confirmMfa(state, {
      onSuccess: () => {
        toast.success(messages.mfaConfirmSuccess);
        navigate({ to: '/settings/security' });
      },
      onError: () => {
        toast.error(intl.formatMessage(messages.confirmFail));
      },
    });

    e.preventDefault();
  };

  if (!state.confirmKey) return <ColumnLoading />;

  return (
    <div className='otp-confirm-form'>
      <Form onSubmit={handleSubmit}>
        <div className='otp-confirm-form__step'>
          <p className='otp-confirm-form__step-title'>
            1. <FormattedMessage id='mfa.mfa_setup_scan.title' defaultMessage='Scan' />
          </p>

          <p className='otp-confirm-form__description'>
            <FormattedMessage
              id='mfa.mfa_setup_scan.description'
              defaultMessage='Using your two-factor app, scan this QR code or enter the text key.'
            />
          </p>
        </div>

        <QRCode className='otp-confirm-form__qr' value={state.qrCodeURI} includeMargin />
        {state.confirmKey}

        <p className='otp-confirm-form__step-title'>
          2. <FormattedMessage id='mfa.mfa_setup_verify.title' defaultMessage='Verify' />
        </p>

        <FormGroup
          labelText={<FormattedMessage id='mfa.mfa_setup.code.placeholder' defaultMessage='Code' />}
          hintText={
            <FormattedMessage
              id='mfa.mfa_setup.code.hint'
              defaultMessage='Enter the code from your two-factor app.'
            />
          }
        >
          <Input
            name='code'
            placeholder={intl.formatMessage(messages.codePlaceholder)}
            onChange={handleInputChange}
            autoComplete='one-time-code'
            disabled={isPending}
            value={state.code}
            type='text'
            required
          />
        </FormGroup>

        {features.manageMfaRequiresPassword && (
          <FormGroup
            labelText={
              <FormattedMessage id='mfa.mfa_setup.password.placeholder' defaultMessage='Password' />
            }
            hintText={
              <FormattedMessage
                id='mfa.mfa_setup.password.hint'
                defaultMessage='Enter your current password to confirm your identity.'
              />
            }
          >
            <Input
              type='password'
              name='password'
              placeholder={intl.formatMessage(messages.passwordPlaceholder)}
              onChange={handleInputChange}
              disabled={isPending}
              value={state.password}
              required
            />
          </FormGroup>
        )}

        <div className='otp-confirm-form__actions form__actions'>
          <button
            type='button'
            onClick={() => navigate({ to: '/settings/security' })}
            disabled={isPending}
          >
            <FormattedMessage id='column.mfa_cancel' defaultMessage='Cancel' />
          </button>

          <button type='submit' disabled={isPending}>
            <FormattedMessage id='column.mfa_confirm_button' defaultMessage='Confirm' />
          </button>
        </div>
      </Form>
    </div>
  );
};

export { OtpConfirmForm as default };
