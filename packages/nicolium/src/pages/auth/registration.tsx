import React from 'react';
import { FormattedMessage } from 'react-intl';

import { BigCard } from '@/components/ui/big-card';
import Text from '@/components/ui/text';
import RegistrationForm from '@/features/auth-login/components/registration-form';
import { useRegistrationStatus } from '@/hooks/use-registration-status';
import { useInstance } from '@/stores/instance';

const RegistrationPage: React.FC = () => {
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();

  if (!isOpen) {
    return (
      <BigCard
        title={
          <FormattedMessage id='registration.closed_title' defaultMessage='Registrations closed' />
        }
      >
        <Text theme='muted' align='center'>
          <FormattedMessage
            id='registration.closed_message'
            defaultMessage='{instance} is not accepting new members'
            values={{ instance: instance.title }}
          />
        </Text>
      </BigCard>
    );
  }

  return (
    <BigCard title={<FormattedMessage id='column.registration' defaultMessage='Sign up' />}>
      <RegistrationForm />
    </BigCard>
  );
};

export { RegistrationPage as default };
