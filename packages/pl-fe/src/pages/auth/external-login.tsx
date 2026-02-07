import React from 'react';
import { FormattedMessage } from 'react-intl';

import { BigCard } from '@/components/big-card';
import ExternalLoginForm from '@/features/external-login/components/external-login-form';

/** Page for logging into a remote instance */
const ExternalLoginPage: React.FC = () => (
  <BigCard title={<FormattedMessage id='login_form.header' defaultMessage='Sign in' />}>
    <ExternalLoginForm />
  </BigCard>
);

export { ExternalLoginPage as default };
