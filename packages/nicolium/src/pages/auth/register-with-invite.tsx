import React from 'react';
import { FormattedMessage } from 'react-intl';

import { BigCard } from '@/components/ui/big-card';
import { inviteRoute } from '@/router';
import { useInstance } from '@/stores/instance';

import RegistrationForm from './components/registration-form';

/** Page to register with an invitation. */
const RegisterWithInvitePage: React.FC = () => {
  const { token } = inviteRoute.useParams();
  const instance = useInstance();

  const title = (
    <FormattedMessage
      id='register_invite.title'
      defaultMessage="You've been invited to join {siteTitle}!"
      values={{ siteTitle: instance.title }}
    />
  );

  const subtitle = (
    <FormattedMessage
      id='register_invite.lead'
      defaultMessage='Complete the form below to create an account.'
    />
  );

  return (
    <BigCard title={title} subtitle={subtitle}>
      <RegistrationForm inviteToken={token} />
    </BigCard>
  );
};

export { RegisterWithInvitePage as default };
