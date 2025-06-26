import React, { useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';

import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useMfaConfig } from 'pl-fe/queries/security/use-mfa';

import DisableOtpForm from './mfa/disable-otp-form';
import EnableOtpForm from './mfa/enable-otp-form';
import OtpConfirmForm from './mfa/otp-confirm-form';

const messages = defineMessages({
  heading: { id: 'column.mfa', defaultMessage: 'Multi-factor authentication' },
});

const MfaForm: React.FC = () => {
  const intl = useIntl();
  const features = useFeatures();
  const [displayOtpForm, setDisplayOtpForm] = useState<boolean>(false);

  const { data: mfa } = useMfaConfig();

  const handleSetupProceedClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setDisplayOtpForm(true);
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      {mfa?.settings.totp ? (
        <DisableOtpForm />
      ) : (
        <Stack space={4}>
          {features.manageMfaBackupCodes && <EnableOtpForm displayOtpForm={displayOtpForm} handleSetupProceedClick={handleSetupProceedClick} />}
          {(displayOtpForm || !features.manageMfaBackupCodes) && <OtpConfirmForm />}
        </Stack>
      )}
    </Column>
  );
};

export { MfaForm as default };
