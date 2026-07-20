import iconAt from '@phosphor-icons/core/regular/at.svg';
import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Select from '@/components/ui/select';
import { useAdminCreateAccountMutation } from '@/queries/admin/use-accounts';
import { useInstance } from '@/stores/instance';
import toast from '@/toast';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  username: {
    id: 'registration.fields.username.placeholder',
    defaultMessage: 'Username',
  },
  email: {
    id: 'registration.fields.email.placeholder',
    defaultMessage: 'E-mail address',
  },
  password: {
    id: 'registration.fields.password.placeholder',
    defaultMessage: 'Password',
  },
  confirm: {
    id: 'registration.fields.confirm.placeholder',
    defaultMessage: 'Password (again)',
  },
  passwordMismatch: {
    id: 'registration.password_mismatch',
    defaultMessage: 'Passwords don’t match.',
  },
  createSuccess: {
    id: 'admin.create_account.created',
    defaultMessage: 'Account created',
  },
});

const CreateAccountModal: React.FC<BaseModalProps> = ({ onClose }) => {
  const intl = useIntl();
  const instance = useInstance();
  const { mutate: createAccount, isPending } = useAdminCreateAccountMutation();

  const domains = instance.pleroma.metadata.multitenancy.enabled
    ? instance.pleroma.metadata.multitenancy.domains
    : undefined;

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [domain, setDomain] = useState<string | undefined>();

  const onClickClose = () => {
    onClose('CREATE_ACCOUNT');
  };

  const passwordsMatch = () => password === passwordConfirmation;

  const handleSubmit = () => {
    if (!passwordsMatch()) {
      setPasswordMismatch(true);
      return;
    }

    createAccount(
      {
        nickname,
        email,
        password,
        domain: domains ? (domain ?? domains[0]?.id) : undefined,
      },
      {
        onSuccess: () => {
          toast.success(messages.createSuccess);
          onClose('CREATE_ACCOUNT');
        },
      },
    );
  };

  return (
    <Modal
      onClose={onClickClose}
      title={<FormattedMessage id='column.admin.create_account' defaultMessage='Create account' />}
      confirmationAction={handleSubmit}
      confirmationText={
        <FormattedMessage id='admin.create_account.create' defaultMessage='Create' />
      }
      confirmationDisabled={isPending}
    >
      <Form>
        <FormGroup
          hintText={
            <FormattedMessage
              id='registration.fields.username.hint'
              defaultMessage='Only letters, numbers, and underscores are allowed.'
            />
          }
        >
          <Input
            type='text'
            name='nickname'
            placeholder={intl.formatMessage(messages.username)}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            pattern='^[a-zA-Z\d_-]+'
            icon={iconAt}
            value={nickname}
            onChange={({ target }) => setNickname(target.value)}
            required
          />
        </FormGroup>

        {domains && (
          <FormGroup
            labelText={
              <FormattedMessage
                id='admin.create_account.fields.domain.label'
                defaultMessage='Domain'
              />
            }
          >
            <Select
              value={domain ?? domains[0]?.id}
              onChange={({ target }) => setDomain(target.value || undefined)}
              required
            >
              {domains.map(({ id, domain: domainName }) => (
                <option key={id} value={id}>
                  {domainName}
                </option>
              ))}
            </Select>
          </FormGroup>
        )}

        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.create_account.fields.email.label'
              defaultMessage='E-mail address'
            />
          }
        >
          <Input
            type='email'
            name='email'
            placeholder={intl.formatMessage(messages.email)}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            required
          />
        </FormGroup>

        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.create_account.fields.password.label'
              defaultMessage='Password'
            />
          }
        >
          <Input
            type='password'
            // don't autofill with current user password
            name='create_account_password'
            placeholder={intl.formatMessage(messages.password)}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            value={password}
            onChange={({ target }) => {
              setPassword(target.value);
              if (target.value === passwordConfirmation) {
                setPasswordMismatch(false);
              }
            }}
            required
          />
        </FormGroup>

        <FormGroup
          labelText={
            <FormattedMessage
              id='admin.create_account.fields.confirm.label'
              defaultMessage='Confirm password'
            />
          }
          errors={passwordMismatch ? [intl.formatMessage(messages.passwordMismatch)] : undefined}
        >
          <Input
            type='password'
            name='password_confirmation'
            placeholder={intl.formatMessage(messages.confirm)}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            value={passwordConfirmation}
            onChange={({ target }) => {
              setPasswordConfirmation(target.value);
              if (password === target.value) {
                setPasswordMismatch(false);
              }
            }}
            onBlur={() => setPasswordMismatch(!passwordsMatch())}
            required
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export { CreateAccountModal as default };
