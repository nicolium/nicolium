import React, { useEffect, useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { fetchMfa } from 'pl-fe/actions/mfa';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';

import DisableOtpForm from './mfa/disable-otp-form';
import EnableOtpForm from './mfa/enable-otp-form';
import OtpConfirmForm from './mfa/otp-confirm-form';

const messages = defineMessages({
  heading: { id: 'column.mfa', defaultMessage: 'Multi-factor authentication' },
});

const MfaForm: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const [displayOtpForm, setDisplayOtpForm] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchMfa());
  }, []);

  const handleSetupProceedClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setDisplayOtpForm(true);
  };

  const mfa = useAppSelector((state) => state.security.mfa);

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      {mfa.settings.totp ? (
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
