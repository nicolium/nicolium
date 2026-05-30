import { Link } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import Spinner from '@/components/ui/spinner';
import { useClient } from '@/hooks/use-client';
import toast from '@/toast';

const messages = defineMessages({
  codesFail: { id: 'security.codes.fail', defaultMessage: 'Failed to fetch backup codes' },
});

interface IEnableOtpForm {
  displayOtpForm: boolean;
  handleSetupProceedClick: (event: React.MouseEvent) => void;
}

const EnableOtpForm: React.FC<IEnableOtpForm> = ({ displayOtpForm, handleSetupProceedClick }) => {
  const intl = useIntl();
  const client = useClient();

  const [backupCodes, setBackupCodes] = useState<Array<string>>([]);

  useEffect(() => {
    client.settings.mfa
      .getMfaBackupCodes()
      .then(({ codes: backupCodes }) => {
        setBackupCodes(backupCodes);
      })
      .catch(() => {
        toast.error(intl.formatMessage(messages.codesFail));
      });
  }, []);

  return (
    <div className='enable-otp-form'>
      <p className='enable-otp-form__warning'>
        <FormattedMessage
          id='mfa.setup_warning'
          defaultMessage="Write these codes down or save them somewhere secure - otherwise you won't see them again. If you lose access to your 2FA app and recovery codes you'll be locked out of your account."
        />
      </p>

      <div className='enable-otp-form__codes-box'>
        <p className='enable-otp-form__codes-title'>
          <FormattedMessage id='mfa.setup_recoverycodes' defaultMessage='Recovery codes' />
        </p>

        {backupCodes.length > 0 ? (
          <div className='enable-otp-form__codes-grid'>
            {backupCodes.map((code) => (
              <p key={code}>{code}</p>
            ))}
          </div>
        ) : (
          <Spinner />
        )}
      </div>

      {!displayOtpForm && (
        <div className='enable-otp-form__actions form__actions'>
          <Link to='/settings/security'>
            <FormattedMessage id='column.mfa_cancel' defaultMessage='Cancel' />
          </Link>

          {backupCodes.length > 0 && (
            <button type='button' onClick={handleSetupProceedClick}>
              <FormattedMessage id='column.mfa_setup' defaultMessage='Proceed to setup' />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export { EnableOtpForm as default };
