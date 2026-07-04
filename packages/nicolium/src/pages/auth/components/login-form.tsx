import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import * as BuildConfig from '@/build-config';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import { useFeatures } from '@/hooks/use-features';

import { handleExternalLogin } from './external-login-form';

const messages = defineMessages({
  username: {
    id: 'login.fields.username.label',
    defaultMessage: 'E-mail or username',
  },
  email: {
    id: 'login.fields.email.label',
    defaultMessage: 'E-mail address',
  },
  password: {
    id: 'login.fields.password.placeholder',
    defaultMessage: 'Password',
  },
});

interface ILoginForm {
  isLoading: boolean;
  handleSubmit: React.SubmitEventHandler<HTMLFormElement>;
}

const LoginForm: React.FC<ILoginForm> = ({ isLoading, handleSubmit }) => {
  const intl = useIntl();
  const features = useFeatures();
  const [isAuthLoading, setAuthLoading] = React.useState(isLoading);

  const usernameLabel = intl.formatMessage(
    features.logInWithUsername ? messages.username : messages.email,
  );
  const passwordLabel = intl.formatMessage(messages.password);

  const handleAuthorizationCodeAuth = () => {
    setAuthLoading(true);
    handleExternalLogin(BuildConfig.BACKEND_URL || window.location.origin).then(() => {
      setAuthLoading(false);
    });
  };

  if (!features.grantTypePassword) {
    return (
      <button
        className='login__with-code'
        onClick={handleAuthorizationCodeAuth}
        disabled={isAuthLoading}
      >
        <FormattedMessage id='login.authorization_code' defaultMessage='Continue to log in' />
      </button>
    );
  }

  return (
    <Form className='login-form' onSubmit={handleSubmit}>
      <FormGroup labelText={usernameLabel}>
        <Input
          aria-label={usernameLabel}
          placeholder={usernameLabel}
          type='text'
          name='username'
          autoCorrect='off'
          autoCapitalize='off'
          required
        />
      </FormGroup>

      <FormGroup
        labelText={passwordLabel}
        hintText={
          <Link to='/reset-password'>
            <FormattedMessage id='login.reset_password.hint' defaultMessage='Trouble logging in?' />
          </Link>
        }
      >
        <Input
          aria-label={passwordLabel}
          placeholder={passwordLabel}
          type='password'
          name='password'
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          required
        />
      </FormGroup>

      <FormActions>
        <button type='submit' disabled={isLoading}>
          <FormattedMessage id='login.sign_in' defaultMessage='Sign in' />
        </button>
      </FormActions>
    </Form>
  );
};

export { LoginForm as default };
