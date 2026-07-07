import React, { useState, useEffect } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';

import { externalLogin, loginWithCode, viewAsGuest } from '@/actions/external-auth';
import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import toast from '@/toast';

const messages = defineMessages({
  instanceLabel: { id: 'login.fields.instance.label', defaultMessage: 'Instance' },
  instancePlaceholder: { id: 'login.fields.instance.placeholder', defaultMessage: 'example.com' },
  instanceFailed: {
    id: 'login_external.error.instance',
    defaultMessage: 'The instance returned an error. Is the URL correct?',
  },
  corsFailed: {
    id: 'login_external.error.cors',
    defaultMessage:
      'Connection failed, likely due to CORS configuration. Is the instance configured to allow logins from other origins?',
  },
  networkFailed: {
    id: 'login_external.error.network',
    defaultMessage: 'Connection failed. Is a browser extension blocking it?',
  },
});

const handleExternalLogin = (host: string) =>
  externalLogin(host).catch((error) => {
    console.error(error);
    const status = error.response?.status;

    if (status || !error.message) {
      toast.error(messages.instanceFailed);
    } else if (error.message === 'NetworkError when attempting to fetch resource.') {
      toast.error(messages.corsFailed);
    } else if (!status && ['Network request failed', 'Timeout'].includes(error.message)) {
      toast.error(messages.networkFailed);
    }
  });

/** Form for logging into a remote instance */
const ExternalLoginForm: React.FC = () => {
  const query = new URLSearchParams(window.location.search);
  const code = query.get('code');
  const server = query.get('server');

  const intl = useIntl();

  const [host, setHost] = useState(server ?? '');
  const [isLoading, setLoading] = useState(false);

  const handleHostChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    setHost(currentTarget.value);
  };

  const handleError = (error: any) => {
    console.error(error);
    const status = error.response?.status;

    if (status || !error.message) {
      toast.error(messages.instanceFailed);
    } else if (error.message === 'NetworkError when attempting to fetch resource.') {
      toast.error(messages.corsFailed);
    } else if (!status && ['Network request failed', 'Timeout'].includes(error.message)) {
      toast.error(messages.networkFailed);
    }

    setLoading(false);
  };

  const handleSubmit = () => {
    setLoading(true);

    handleExternalLogin(host).finally(() => {
      setLoading(false);
    });
  };

  const handleGuest = () => {
    if (!host) return;
    setLoading(true);

    viewAsGuest(host)
      .then(() => {
        setLoading(false);
      })
      .catch(handleError);
  };

  useEffect(() => {
    if (code) {
      loginWithCode(code);
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
    <Form className='external-login' onSubmit={handleSubmit} data-testid='external-login'>
      <FormGroup
        labelText={<FormattedMessage id='login.fields.instance.label' defaultMessage='Instance' />}
      >
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

      <div className='form__actions'>
        <button
          type='button'
          className='external-login__guest'
          disabled={isLoading}
          onClick={handleGuest}
        >
          <FormattedMessage id='login_external.view_as_guest' defaultMessage='View as guest' />
        </button>
        <button type='submit' disabled={isLoading}>
          <FormattedMessage id='login.log_in' defaultMessage='Log in' />
        </button>
      </div>
    </Form>
  );
};

export { ExternalLoginForm as default, handleExternalLogin };
