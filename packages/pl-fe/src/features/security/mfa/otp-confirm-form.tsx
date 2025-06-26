import { QRCodeCanvas as QRCode } from 'qrcode.react';
import React, { useCallback, useEffect, useState } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';
import { useHistory } from 'react-router-dom';

import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import Input from 'pl-fe/components/ui/input';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useConfirmMfa } from 'pl-fe/queries/security/use-mfa';
import toast from 'pl-fe/toast';

const messages = defineMessages({
  mfaCancelButton: { id: 'column.mfa_cancel', defaultMessage: 'Cancel' },
  mfaSetupConfirmButton: { id: 'column.mfa_confirm_button', defaultMessage: 'Confirm' },
  confirmFail: { id: 'security.confirm.fail', defaultMessage: 'Incorrect code or password. Try again.' },
  qrFail: { id: 'security.qr.fail', defaultMessage: 'Failed to fetch setup key' },
  mfaConfirmSuccess: { id: 'mfa.confirm.success_message', defaultMessage: 'MFA confirmed' },
  codePlaceholder: { id: 'mfa.mfa_setup.code_placeholder', defaultMessage: 'Code' },
  passwordPlaceholder: { id: 'mfa.mfa_setup.password_placeholder', defaultMessage: 'Password' },
});

const OtpConfirmForm: React.FC = () => {
  const intl = useIntl();
  const history = useHistory();
  const features = useFeatures();
  const client = useClient();

  const { mutate: confirmMfa, isPending } = useConfirmMfa();

  const [state, setState] = useState<{ password: string; code: string; qrCodeURI: string; confirmKey: string }>({
    password: '',
    code: '',
    qrCodeURI: '',
    confirmKey: '',
  });

  useEffect(() => {
    client.settings.mfa.getMfaSetup('totp').then((data) => {
      setState((prevState) => ({ ...prevState, qrCodeURI: data.provisioning_uri, confirmKey: data.key }));
    }).catch(() => {
      toast.error(intl.formatMessage(messages.qrFail));
    });
  }, []);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    event.persist();

    setState((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    setState((prevState) => ({ ...prevState, isLoading: true }));

    confirmMfa(state, {
      onSuccess: () => {
        toast.success(intl.formatMessage(messages.mfaConfirmSuccess));
        history.push('../auth/edit');
      },
      onError: () => {
        toast.error(intl.formatMessage(messages.confirmFail));
      },
    });

    e.preventDefault();
  };

  return (
    <Stack space={4}>
      <Form onSubmit={handleSubmit}>
        <Stack>
          <Text weight='semibold' size='lg'>
            1. <FormattedMessage id='mfa.mfa_setup_scan_title' defaultMessage='Scan' />
          </Text>

          <Text theme='muted'>
            <FormattedMessage id='mfa.mfa_setup_scan_description' defaultMessage='Using your two-factor app, scan this QR code or enter the text key.' />
          </Text>
        </Stack>

        <QRCode className='rounded-lg' value={state.qrCodeURI} includeMargin />
        {state.confirmKey}

        <Text weight='semibold' size='lg'>
          2. <FormattedMessage id='mfa.mfa_setup_verify_title' defaultMessage='Verify' />
        </Text>

        <FormGroup
          labelText={intl.formatMessage(messages.codePlaceholder)}
          hintText={<FormattedMessage id='mfa.mfa_setup.code_hint' defaultMessage='Enter the code from your two-factor app.' />}
        >
          <Input
            name='code'
            placeholder={intl.formatMessage(messages.codePlaceholder)}
            onChange={handleInputChange}
            autoComplete='off'
            disabled={isPending}
            value={state.code}
            type='text'
            required
          />
        </FormGroup>

        {features.manageMfaRequiresPassword && (
          <FormGroup
            labelText={intl.formatMessage(messages.passwordPlaceholder)}
            hintText={<FormattedMessage id='mfa.mfa_setup.password_hint' defaultMessage='Enter your current password to confirm your identity.' />}
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

        <FormActions>
          <Button
            type='button'
            theme='tertiary'
            text={intl.formatMessage(messages.mfaCancelButton)}
            onClick={() => history.push('../auth/edit')}
            disabled={isPending}
          />

          <Button
            type='submit'
            theme='primary'
            text={intl.formatMessage(messages.mfaSetupConfirmButton)}
            disabled={isPending}
          />
        </FormActions>
      </Form>
    </Stack>
  );
};

export { OtpConfirmForm as default };
