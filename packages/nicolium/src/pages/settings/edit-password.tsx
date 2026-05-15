import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import { useClient } from '@/hooks/use-client';
import toast from '@/toast';

const messages = defineMessages({
  updatePasswordSuccess: {
    id: 'security.update_password.success',
    defaultMessage: 'Password updated',
  },
  updatePasswordFail: {
    id: 'security.update_password.fail',
    defaultMessage: 'Update password failed.',
  },
  passwordsNoMatch: {
    id: 'security.update_password.password_confirmation_no_match',
    defaultMessage: 'Passwords do not match.',
  },
  header: { id: 'edit_password.header', defaultMessage: 'Change password' },
});

const initialState = { currentPassword: '', newPassword: '', newPasswordConfirmation: '' };

const EditPasswordPage = () => {
  const intl = useIntl();
  const client = useClient();

  const [state, setState] = React.useState(initialState);
  const [isLoading, setLoading] = React.useState(false);

  const { currentPassword, newPassword, newPasswordConfirmation } = state;

  const resetState = () => {
    setState(initialState);
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
    (event) => {
      event.persist();

      setState((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
    },
    [],
  );

  const handleSubmit = React.useCallback(() => {
    if (newPassword !== newPasswordConfirmation) {
      toast.error(intl.formatMessage(messages.passwordsNoMatch));
      return;
    }

    setLoading(true);
    client.settings
      .changePassword(currentPassword, newPassword)
      .then(() => {
        resetState();
        toast.success(messages.updatePasswordSuccess);
      })
      .finally(() => {
        setLoading(false);
      })
      .catch(() => {
        resetState();
        toast.error(intl.formatMessage(messages.updatePasswordFail));
      });
  }, [currentPassword, newPassword, newPasswordConfirmation, intl]);

  return (
    <Column label={intl.formatMessage(messages.header)} backHref='/settings/security'>
      <Form onSubmit={handleSubmit}>
        <FormGroup
          labelText={
            <FormattedMessage
              id='security.fields.old_password.label'
              defaultMessage='Current password'
            />
          }
        >
          <Input
            type='password'
            name='currentPassword'
            onChange={handleInputChange}
            value={currentPassword}
          />
        </FormGroup>

        <FormGroup
          labelText={
            <FormattedMessage
              id='security.fields.new_password.label'
              defaultMessage='New password'
            />
          }
        >
          <Input
            type='password'
            name='newPassword'
            onChange={handleInputChange}
            value={newPassword}
          />
        </FormGroup>

        <FormGroup
          labelText={
            <FormattedMessage
              id='security.fields.password_confirmation.label'
              defaultMessage='New password (again)'
            />
          }
        >
          <Input
            type='password'
            name='newPasswordConfirmation'
            onChange={handleInputChange}
            value={newPasswordConfirmation}
          />
        </FormGroup>

        <FormActions>
          <Button to='/settings/security' theme='tertiary'>
            <FormattedMessage id='common.cancel' defaultMessage='Cancel' />
          </Button>

          <Button
            type='submit'
            theme='primary'
            disabled={isLoading || newPassword !== newPasswordConfirmation}
          >
            <FormattedMessage id='security.submit' defaultMessage='Save changes' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export { EditPasswordPage as default };
