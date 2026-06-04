import React from 'react';
import { FormattedMessage } from 'react-intl';

import { BigCard } from '@/components/ui/big-card';
import { useRegistrationStatus } from '@/hooks/use-registration-status';
import { useInstance } from '@/stores/instance';

import RegistrationForm from './components/registration-form';

const RegistrationPage: React.FC = () => {
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();

  if (!isOpen) {
    return (
      <BigCard
        title={
          <FormattedMessage id='registration.closed.title' defaultMessage='Registrations closed' />
        }
      >
        <p className='confirmation-modal__description'>
          <FormattedMessage
            id='registration.closed.message'
            defaultMessage='{instance} is not accepting new members'
            values={{ instance: instance.title }}
          />
        </p>
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
