import iconAt from '@phosphor-icons/core/regular/at.svg';
import { Link, useNavigate } from '@tanstack/react-router';
import debounce from 'lodash/debounce';
import { ICESHRIMP_NET } from 'pl-api';
import React, { useState, useRef, useCallback } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';

import BirthdayInput from '@/components/birthday-input';
import Checkbox from '@/components/ui/checkbox';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Textarea from '@/components/ui/textarea';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useAuthActions } from '@/stores/auth';
import { useInstance } from '@/stores/instance';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';

import CaptchaField from './captcha';

import type { CreateAccountParams } from 'pl-api';

const messages = defineMessages({
  username: { id: 'registration.fields.username.placeholder', defaultMessage: 'Username' },
  usernameUnavailable: {
    id: 'registration.username_unavailable',
    defaultMessage: 'Username is already taken.',
  },
  email: { id: 'registration.fields.email.placeholder', defaultMessage: 'E-mail address' },
  password: { id: 'registration.fields.password.placeholder', defaultMessage: 'Password' },
  passwordMismatch: {
    id: 'registration.password_mismatch',
    defaultMessage: 'Passwords don’t match.',
  },
  confirm: { id: 'registration.fields.confirm.placeholder', defaultMessage: 'Password (again)' },
  reasonHint: {
    id: 'registration.reason.hint',
    defaultMessage: 'This will help us review your application',
  },
  inviteCode: { id: 'registration.fields.invite_code.placeholder', defaultMessage: 'Invite code' },
});

interface IRegistrationForm {
  inviteToken?: string;
}

/** Allows the user to sign up for the website. */
const RegistrationForm: React.FC<IRegistrationForm> = ({ inviteToken }) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const client = useClient();
  const { locale } = useSettings();
  const features = useFeatures();
  const instance = useInstance();
  const { openModal } = useModalsActions();
  const { register, verifyCredentials } = useAuthActions();

  const isIceshrimp = features.version.software === ICESHRIMP_NET;
  const needsConfirmation = instance.pleroma.metadata.account_activation_required;
  const needsApproval = instance.registrations.approval_required && !isIceshrimp;
  const needsInvite = isIceshrimp && instance.registrations.approval_required;
  const supportsAccountLookup = features.accountLookup;
  const birthdayRequired =
    instance.pleroma.metadata.birthday_required || instance.registrations.min_age;
  const domains = instance.pleroma.metadata.multitenancy.enabled
    ? instance.pleroma.metadata.multitenancy.domains!.filter((domain) => domain.public)
    : undefined;

  const [captchaLoading, setCaptchaLoading] = useState(!isIceshrimp);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [params, setParams] = useState<CreateAccountParams>({
    username: '',
    email: '',
    password: '',
    agreement: false,
    locale: '',
    invite_code: isIceshrimp ? inviteToken : undefined,
  });
  const [captchaIdempotencyKey, setCaptchaIdempotencyKey] = useState(crypto.randomUUID());
  const [usernameUnavailable, setUsernameUnavailable] = useState(false);
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const controller = useRef(new AbortController());

  const onInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    setParams((params) => ({ ...params, [e.target.name]: e.target.value }));
  };

  const onUsernameChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setParams((params) => ({ ...params, username: e.target.value }));
    setUsernameUnavailable(false);
    controller.current.abort();
    controller.current = new AbortController();

    const domain = params.domain;
    usernameAvailable(
      e.target.value,
      domain ? domains!.find(({ id }) => id === domain)?.domain : undefined,
    );
  };

  const onDomainChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setParams((params) => ({ ...params, domain: e.target.value || undefined }));
    setUsernameUnavailable(false);

    controller.current.abort();
    controller.current = new AbortController();

    const username = params.username;
    if (username) {
      usernameAvailable(username, domains!.find(({ id }) => id === e.target.value)?.domain);
    }
  };

  const onCheckboxChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setParams((params) => ({ ...params, [e.target.name]: e.target.checked }));
  };

  const onPasswordChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const password = e.target.value;
    onInputChange(e);

    if (password === passwordConfirmation) {
      setPasswordMismatch(false);
    }
  };

  const onPasswordConfirmChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const password = params.password || '';
    const passwordConfirmation = e.target.value;
    setPasswordConfirmation(passwordConfirmation);

    if (password === passwordConfirmation) {
      setPasswordMismatch(false);
    }
  };

  const onPasswordConfirmBlur: React.ChangeEventHandler<HTMLInputElement> = () => {
    setPasswordMismatch(!passwordsMatch());
  };

  const onBirthdayChange = (birthday: string) => {
    setParams((params) => ({ ...params, birthday }));
  };

  const launchModal = () => {
    const message = (
      <>
        {needsConfirmation && (
          <p>
            <FormattedMessage
              id='confirmations.register.needs_confirmation'
              defaultMessage='Please check your inbox at {email} for confirmation instructions. You will need to verify your e-mail address to continue.'
              values={{ email: <strong>{params.email}</strong> }}
            />
          </p>
        )}
        {needsApproval && (
          <p>
            <FormattedMessage
              id='confirmations.register.needs_approval'
              defaultMessage='Your account will be manually approved by an admin. Please be patient while we review your details.'
            />
          </p>
        )}
      </>
    );

    openModal('CONFIRM', {
      heading: needsConfirmation ? (
        <FormattedMessage
          id='confirmations.register.needs_confirmation.header'
          defaultMessage='Confirmation required'
        />
      ) : needsApproval ? (
        <FormattedMessage
          id='confirmations.register.needs_approval.header'
          defaultMessage='Approval required'
        />
      ) : undefined,
      message,
      confirm: (
        <FormattedMessage id='registration.confirmation_modal.close' defaultMessage='Close' />
      ),
      onConfirm: () => {},
    });
  };

  const postRegisterAction = ({ access_token }: any) => {
    if (needsConfirmation || needsApproval) {
      launchModal();
      return;
    } else {
      return verifyCredentials(access_token).then(() => {
        navigate({ to: '/' });
      });
    }
  };

  const passwordsMatch = () => params.password === passwordConfirmation;

  const usernameAvailable = useCallback(
    debounce(
      (username, domain?: string) => {
        if (!supportsAccountLookup) return;

        controller.current.abort();
        controller.current = new AbortController();

        client.accounts
          .lookupAccount(`${username}${domain ? `@${domain}` : ''}`, {
            signal: controller.current.signal,
          })
          .then((account) => {
            setUsernameUnavailable(!!account);
          })
          .catch((error) => {
            if (error.response?.status === 404) {
              setUsernameUnavailable(false);
            }
          });
      },
      1000,
      { trailing: true },
    ),
    [],
  );

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = () => {
    if (!passwordsMatch()) {
      setPasswordMismatch(true);
      return;
    }

    const normalParams = {
      ...params,
      locale,
    };

    if (inviteToken) {
      params.token = inviteToken;
    }

    setSubmissionLoading(true);

    register(normalParams)
      .then(postRegisterAction)
      .catch(() => {
        setSubmissionLoading(false);
        refreshCaptcha();
      });
  };

  const onCaptchaClick: React.MouseEventHandler = () => {
    refreshCaptcha();
  };

  const onFetchCaptcha = (captcha: Record<string, any>) => {
    setCaptchaLoading(false);
    setParams((params) => ({
      ...params,
      captcha_token: captcha.token,
      captcha_answer_data: captcha.answer_data,
    }));
  };

  const onFetchCaptchaFail = () => {
    setCaptchaLoading(false);
  };

  const refreshCaptcha = () => {
    setCaptchaIdempotencyKey(crypto.randomUUID());
    setParams((params) => ({ ...params, captcha_solution: '' }));
  };

  const isLoading = captchaLoading || submissionLoading;

  return (
    <Form onSubmit={onSubmit} data-testid='registrations-open'>
      <fieldset disabled={isLoading} className='registration-form__fields'>
        <FormGroup
          hintText={
            <FormattedMessage
              id='registration.fields.username.hint'
              defaultMessage='Only letters, numbers, and underscores are allowed.'
            />
          }
          errors={
            usernameUnavailable ? [intl.formatMessage(messages.usernameUnavailable)] : undefined
          }
        >
          <Input
            type='text'
            name='username'
            placeholder={intl.formatMessage(messages.username)}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            pattern='^[a-zA-Z\d_-]+'
            icon={iconAt}
            onChange={onUsernameChange}
            value={params.username}
            required
          />
        </FormGroup>

        {domains && (
          <FormGroup>
            <Select onChange={onDomainChange} value={params.domain}>
              {domains.map(({ id, domain }) => (
                <option key={id} value={id}>
                  {domain}
                </option>
              ))}
            </Select>
          </FormGroup>
        )}

        {!isIceshrimp && (
          <Input
            type='email'
            name='email'
            placeholder={intl.formatMessage(messages.email)}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            onChange={onInputChange}
            value={params.email}
            required
          />
        )}

        <Input
          type='password'
          name='password'
          placeholder={intl.formatMessage(messages.password)}
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          onChange={onPasswordChange}
          value={params.password}
          required
        />

        <FormGroup
          errors={passwordMismatch ? [intl.formatMessage(messages.passwordMismatch)] : undefined}
        >
          <Input
            type='password'
            name='password_confirmation'
            placeholder={intl.formatMessage(messages.confirm)}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            onChange={onPasswordConfirmChange}
            onBlur={onPasswordConfirmBlur}
            value={passwordConfirmation}
            required
          />
        </FormGroup>

        {needsInvite && (
          <Input
            type='text'
            name='invite_code'
            placeholder={intl.formatMessage(messages.inviteCode)}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            onChange={onInputChange}
            value={params.invite_code ?? ''}
            required
          />
        )}

        {birthdayRequired && (
          <BirthdayInput value={params.date_of_birth ?? ''} onChange={onBirthdayChange} required />
        )}

        {needsApproval && (
          <FormGroup
            labelText={
              <FormattedMessage
                id='registration.reason'
                defaultMessage='Why do you want to join?'
              />
            }
          >
            <Textarea
              name='reason'
              placeholder={intl.formatMessage(messages.reasonHint)}
              maxLength={500}
              onChange={onInputChange}
              value={params.reason ?? ''}
              autoGrow
              required
            />
          </FormGroup>
        )}

        {!isIceshrimp && (
          <CaptchaField
            onFetch={onFetchCaptcha}
            onFetchFail={onFetchCaptchaFail}
            onChange={onInputChange}
            onClick={onCaptchaClick}
            idempotencyKey={captchaIdempotencyKey}
            name='captcha_solution'
            value={params.captcha_solution ?? ''}
          />
        )}

        <FormGroup
          labelText={
            <FormattedMessage
              id='registration.agreement'
              defaultMessage='I agree to the {tos}.'
              values={{
                tos: (
                  <Link to='/about/{-$slug}' params={{ slug: 'tos' }} target='_blank'>
                    <FormattedMessage id='registration.tos' defaultMessage='Terms of Service' />
                  </Link>
                ),
              }}
            />
          }
        >
          <Checkbox
            name='agreement'
            onChange={onCheckboxChange}
            checked={params.agreement}
            required
          />
        </FormGroup>

        <FormActions>
          <button type='submit'>
            <FormattedMessage id='registration.sign_up' defaultMessage='Sign up' />
          </button>
        </FormActions>
      </fieldset>
    </Form>
  );
};

export { RegistrationForm as default };
