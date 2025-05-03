import React from 'react';
import { FormattedMessage } from 'react-intl';

import { BigCard } from 'pl-fe/components/big-card';
import ExternalLoginForm from 'pl-fe/features/external-login/components/external-login-form';

/** Page for logging into a remote instance */
const ExternalLoginPage: React.FC = () => (
  <BigCard title={<FormattedMessage id='login_form.header' defaultMessage='Sign in' />}>
    <ExternalLoginForm />
  </BigCard>
);

export { ExternalLoginPage as default };
