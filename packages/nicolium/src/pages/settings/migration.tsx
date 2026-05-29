import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import { useClient } from '@/hooks/use-client';
import { useInstance } from '@/stores/instance';
import toast from '@/toast';

const messages = defineMessages({
  heading: { id: 'column.migration', defaultMessage: 'Move account' },
  moveAccountSuccess: { id: 'migration.move_account.success', defaultMessage: 'Account moved' },
  moveAccountFail: {
    id: 'migration.move_account.fail',
    defaultMessage: 'Failed to migrate account',
  },
  moveAccountFailCooldownPeriod: {
    id: 'migration.move_account.fail.cooldown_period',
    defaultMessage: 'You have moved your account too recently. Please try again later.',
  },
  acctFieldPlaceholder: {
    id: 'migration.fields.acct.placeholder',
    defaultMessage: 'username@domain',
  },
});

const MigrationPage = () => {
  const intl = useIntl();
  const client = useClient();
  const instance = useInstance();

  const cooldownPeriod = instance.pleroma.metadata.migration_cooldown_period;

  const [targetAccount, setTargetAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.name === 'password') setPassword(e.target.value);
    else setTargetAccount(e.target.value);
  };

  const clearForm = () => {
    setTargetAccount('');
    setPassword('');
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = () => {
    setIsLoading(true);
    return client.settings
      .moveAccount(targetAccount, password)
      .then(() => {
        clearForm();
        toast.success(messages.moveAccountSuccess);
      })
      .catch((error) => {
        let message = intl.formatMessage(messages.moveAccountFail);

        const errorMessage = error.response?.data?.error;
        if (errorMessage === 'You are within cooldown period.') {
          message = intl.formatMessage(messages.moveAccountFailCooldownPeriod);
        }

        toast.error(message);
      })
      .then(() => {
        setIsLoading(false);
      });
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form onSubmit={handleSubmit}>
        <p className='migration-form__hint'>
          <FormattedMessage
            id='migration.hint'
            defaultMessage='This will move your followers to the new account. No other data will be moved. To perform migration, you need to {link} on your new account first.'
            values={{
              link: (
                <Link to='/settings/aliases'>
                  <FormattedMessage
                    id='migration.hint.link'
                    defaultMessage='create an account alias'
                  />
                </Link>
              ),
            }}
          />
          {!!cooldownPeriod && (
            <>
              {' '}
              <FormattedMessage
                id='migration.hint.cooldown_period'
                defaultMessage='If you migrate your account, you will not be able to migrate your account for {cooldownPeriod, plural, one {one day} other {the next # days}}.'
                values={{ cooldownPeriod }}
              />
            </>
          )}
        </p>
        <FormGroup
          labelText={
            <FormattedMessage
              id='migration.fields.acct.label'
              defaultMessage='Handle of the new account'
            />
          }
        >
          <Input
            name='targetAccount'
            placeholder={intl.formatMessage(messages.acctFieldPlaceholder)}
            onChange={handleInputChange}
            value={targetAccount}
            required
          />
        </FormGroup>
        <FormGroup
          labelText={
            <FormattedMessage
              id='migration.fields.confirm_password.label'
              defaultMessage='Current password'
            />
          }
        >
          <Input
            type='password'
            name='password'
            onChange={handleInputChange}
            value={password}
            required
          />
        </FormGroup>
        <div className='migration-form__actions'>
          <button type='submit' disabled={isLoading}>
            <FormattedMessage id='migration.submit' defaultMessage='Move followers' />
          </button>
        </div>
      </Form>
    </Column>
  );
};

export { MigrationPage as default };
