import { useNavigate } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';

import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import { useLoggedIn } from '@/hooks/use-logged-in';
import toast from '@/toast';
import { externalLogin, loginWithCode, viewAsGuest } from '@/utils/auth/external-auth';

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

const loginErrorMessage = (error: any) => {
  if (error.response?.status || !error.message) {
    return messages.instanceFailed;
  }
  if (error.message === 'Timeout') {
    return messages.networkFailed;
  }
  return messages.corsFailed;
};

const handleExternalLogin = (host: string, switchAccount = true) =>
  externalLogin(host, switchAccount).catch((error) => {
    console.error(error);
    toast.error(loginErrorMessage(error));
  });

/** Form for logging into a remote instance */
const ExternalLoginForm: React.FC = () => {
  const search = window.location.search.match(/^\?switchAccount={true|false}\?/)
    ? window.location.search.replace(/^\?switchAccount=(true|false)\?/, (match) =>
        match === '?switchAccount=true?' ? '?switchAccount=true&' : '?',
      )
    : window.location.search;
  const query = new URLSearchParams(search);
  const code = query.get('code');
  const server = query.get('server');
  const switchAccount = query.get('switchAccount') !== 'false';

  const navigate = useNavigate();
  const intl = useIntl();
  const { isLoggedIn } = useLoggedIn();

  const [host, setHost] = useState(server ?? '');
  const [isLoading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleHostChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    setHost(currentTarget.value);
  };

  const handleError = (error: any) => {
    console.error(error);
    toast.error(loginErrorMessage(error));

    setLoading(false);
    setFailed(true);
  };

  const handleSubmit = () => {
    setLoading(true);
    setFailed(false);

    externalLogin(host).catch(handleError);
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
      loginWithCode(code, switchAccount).then(() => {
        if (!switchAccount) {
          navigate({ to: '/deck' });
        }
      });
    }
  }, [code]);

  useEffect(() => {
    if (server && !code) {
      handleSubmit();
    }
  }, [server]);

  if ((code || server) && !failed) {
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
          value={host}
          onChange={handleHostChange}
          autoCorrect='off'
          autoCapitalize='off'
          required
        />
      </FormGroup>

      <div className='form__actions'>
        {!isLoggedIn && (
          <button
            type='button'
            className='external-login__guest'
            disabled={isLoading}
            onClick={handleGuest}
          >
            <FormattedMessage id='login_external.view_as_guest' defaultMessage='View as guest' />
          </button>
        )}
        <button type='submit' disabled={isLoading}>
          <FormattedMessage id='login.log_in' defaultMessage='Log in' />
        </button>
      </div>
    </Form>
  );
};

export { ExternalLoginForm as default, handleExternalLogin };
