import { Link } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import { useClient } from '@/hooks/use-client';
import toast from '@/toast';

const messages = defineMessages({
  header: { id: 'column.change_email', defaultMessage: 'Change e-mail' },
  updateEmailSuccess: {
    id: 'security.update_email.success',
    defaultMessage: 'E-mail updated',
  },
  updateEmailFail: { id: 'security.update_email.fail', defaultMessage: 'Updating e-mail failed.' },
  emailFieldPlaceholder: { id: 'edit_email.placeholder', defaultMessage: 'me@example.com' },
});

const initialState = { email: '', password: '' };

const EditEmailPage = () => {
  const intl = useIntl();
  const client = useClient();

  const [state, setState] = React.useState(initialState);
  const [isLoading, setLoading] = React.useState(false);

  const { email, password } = state;

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
    (event) => {
      event.persist();
      setState((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
    },
    [],
  );

  const handleSubmit = React.useCallback(() => {
    setLoading(true);
    client.settings
      .changeEmail(email, password)
      .then(() => {
        setState(initialState);
        toast.success(messages.updateEmailSuccess);
      })
      .finally(() => {
        setLoading(false);
      })
      .catch(() => {
        setState((prevState) => ({ ...prevState, password: '' }));
        toast.error(intl.formatMessage(messages.updateEmailFail));
      });
  }, [email, password, intl]);

  return (
    <Column label={intl.formatMessage(messages.header)} backHref='/settings'>
      <Form onSubmit={handleSubmit}>
        <FormGroup
          labelText={
            <FormattedMessage id='security.fields.email.label' defaultMessage='E-mail address' />
          }
        >
          <Input
            type='text'
            placeholder={intl.formatMessage(messages.emailFieldPlaceholder)}
            name='email'
            autoComplete='off'
            onChange={handleInputChange}
            value={email}
          />
        </FormGroup>

        <FormGroup
          labelText={
            <FormattedMessage id='security.fields.password.label' defaultMessage='Password' />
          }
        >
          <Input type='password' name='password' onChange={handleInputChange} value={password} />
        </FormGroup>

        <div className='edit-email__actions'>
          <Link to='/settings'>
            <FormattedMessage id='common.cancel' defaultMessage='Cancel' />
          </Link>
          <button type='submit' disabled={isLoading}>
            <FormattedMessage id='security.submit' defaultMessage='Save changes' />
          </button>
        </div>
      </Form>
    </Column>
  );
};

export { EditEmailPage as default };
