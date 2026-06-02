import React, { useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';

import Column from '@/components/ui/column';
import ColumnLoading from '@/features/ui/components/column-loading';
import { useFeatures } from '@/hooks/use-features';
import { useMfaConfig } from '@/queries/security/use-mfa';

import DisableOtpForm from './components/disable-otp-form';
import EnableOtpForm from './components/enable-otp-form';
import OtpConfirmForm from './components/otp-confirm-form';

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

  if (!mfa) return <ColumnLoading />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      {mfa.settings.totp ? (
        <DisableOtpForm />
      ) : (
        <div className='mfa-setup'>
          {features.manageMfaBackupCodes && (
            <EnableOtpForm
              displayOtpForm={displayOtpForm}
              handleSetupProceedClick={handleSetupProceedClick}
            />
          )}
          {(displayOtpForm || !features.manageMfaBackupCodes) && <OtpConfirmForm />}
        </div>
      )}
    </Column>
  );
};

export { MfaForm as default };
