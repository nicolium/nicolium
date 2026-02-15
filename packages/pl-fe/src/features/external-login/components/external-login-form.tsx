import React, { useState, useEffect } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';

import { externalLogin, loginWithCode } from '@/actions/external-auth';
import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import toast from '@/toast';

const messages = defineMessages({
  instanceLabel: { id: 'login.fields.instance_label', defaultMessage: 'Instance' },
  instancePlaceholder: { id: 'login.fields.instance_placeholder', defaultMessage: 'example.com' },
  instanceFailed: { id: 'login_external.errors.instance_fail', defaultMessage: 'The instance returned an error.' },
  networkFailed: { id: 'login_external.errors.network_fail', defaultMessage: 'Connection failed. Is a browser extension blocking it?' },
});

/** Form for logging into a remote instance */
const ExternalLoginForm: React.FC = () => {
  const query = new URLSearchParams(window.location.search);
  const code = query.get('code');
  const server = query.get('server');

  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [host, setHost] = useState(server ?? '');
  const [isLoading, setLoading] = useState(false);

  const handleHostChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    setHost(currentTarget.value);
  };

  const handleSubmit = () => {
    setLoading(true);

    externalLogin(host)
      .then(() =>{
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        const status = error.response?.status;

        if (status) {
          toast.error(intl.formatMessage(messages.instanceFailed));
        } else if (!status && ['Network request failed', 'Timeout'].includes(error.message)) {
          toast.error(intl.formatMessage(messages.networkFailed));
        }

        // If the server was invalid, clear it from the URL.
        // https://stackoverflow.com/a/40592892
        if (server) {
          window.history.pushState(null, '', window.location.pathname);
        }

        setLoading(false);
      });
  };

  useEffect(() => {
    if (code) {
      dispatch(loginWithCode(code));
    }
  }, [code]);

  useEffect(() => {
    if (server && !code) {
      handleSubmit();
    }
  }, [server]);

  if (code || server) {
    return <Spinner />;
  }

  return (
    <Form className='⁂-external-login' onSubmit={handleSubmit} data-testid='external-login'>
      <FormGroup labelText={intl.formatMessage(messages.instanceLabel)}>
        <Input
          aria-label={intl.formatMessage(messages.instancePlaceholder)}
          placeholder={intl.formatMessage(messages.instancePlaceholder)}
          type='text'
          name='host'
          onChange={handleHostChange}
          autoCorrect='off'
          autoCapitalize='off'
          required
        />
      </FormGroup>

      <div className='⁂-form__actions'>
        <button type='submit' disabled={isLoading}>
          <FormattedMessage id='login.log_in' defaultMessage='Log in' />
        </button>
      </div>
    </Form>
  );
};

export { ExternalLoginForm as default };
