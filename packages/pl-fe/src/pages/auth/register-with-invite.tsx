import React from 'react';
import { FormattedMessage } from 'react-intl';

import { BigCard } from 'pl-fe/components/big-card';
import RegistrationForm from 'pl-fe/features/auth-login/components/registration-form';
import { inviteRoute } from 'pl-fe/features/ui/router';
import { useInstance } from 'pl-fe/hooks/use-instance';

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
