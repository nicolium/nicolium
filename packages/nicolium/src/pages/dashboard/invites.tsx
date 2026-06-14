import iconCopy from '@phosphor-icons/core/regular/copy.svg';
import React, { useState } from 'react';
import { FormattedDate, FormattedMessage, defineMessages, useIntl } from 'react-intl';

import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import Icon from '@/components/ui/icon';
import Input from '@/components/ui/input';
import {
  useInvites,
  useCreateInviteTokenMutation,
  useRevokeInviteTokenMutation,
  useEmailInviteMutation,
} from '@/queries/admin/use-invites';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';
import copy from '@/utils/copy';

import type { AdminInvite } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.invites', defaultMessage: 'Invites' },
  maxUsePlaceholder: {
    id: 'admin.invites.max_use.placeholder',
    defaultMessage: 'Max uses (optional)',
  },
  expiresPlaceholder: {
    id: 'admin.invites.expires_at.placeholder',
    defaultMessage: 'Expiry date (optional)',
  },
  emailPlaceholder: { id: 'admin.invites.email.placeholder', defaultMessage: 'E-mail address' },
  namePlaceholder: { id: 'admin.invites.name.placeholder', defaultMessage: 'Name (optional)' },
  createSuccess: { id: 'admin.invites.create.success', defaultMessage: 'Invite token created' },
  createError: {
    id: 'admin.invites.create.error',
    defaultMessage: 'Failed to create invite token',
  },
  emailSuccess: { id: 'admin.invites.email.success', defaultMessage: 'Invite e-mail sent' },
  emailError: { id: 'admin.invites.email.error', defaultMessage: 'Failed to send invite e-mail' },
  emailErrorInvitesDisabled: {
    id: 'admin.invites.email.error.invites_disabled',
    defaultMessage: 'You need to enable user invitations for admins to use this feature',
  },
  revokeSuccess: { id: 'admin.invites.revoke.success', defaultMessage: 'Invite token revoked' },
  revokeError: {
    id: 'admin.invites.revoke.error',
    defaultMessage: 'Failed to revoke invite token',
  },
  revokeConfirm: { id: 'confirmations.admin.revoke_invite.confirm', defaultMessage: 'Revoke' },
  copied: { id: 'admin.invites.copied', defaultMessage: 'Token copied to clipboard' },
});

interface IInvite {
  invite: AdminInvite;
}

const Invite: React.FC<IInvite> = ({ invite }) => {
  const intl = useIntl();

  const { openModal } = useModalsActions();
  const { mutate } = useRevokeInviteTokenMutation();

  const handleCopy = () => {
    copy(invite.token, () => toast.success(intl.formatMessage(messages.copied)));
  };

  const handleRevoke = () => {
    openModal('CONFIRM', {
      heading: (
        <FormattedMessage
          id='confirmations.admin.revoke_invite.heading'
          defaultMessage='Revoke invite token'
        />
      ),
      message: (
        <FormattedMessage
          id='confirmations.admin.revoke_invite.message'
          defaultMessage='Are you sure you want to revoke this invite token?'
        />
      ),
      confirm: intl.formatMessage(messages.revokeConfirm),
      onConfirm: () => {
        mutate(invite.token, {
          onSuccess: () => toast.success(intl.formatMessage(messages.revokeSuccess)),
          onError: () => toast.error(intl.formatMessage(messages.revokeError)),
        });
      },
    });
  };

  return (
    <div className='admin-invite'>
      <div className='admin-invite__token'>
        <code>{invite.token}</code>
        <button
          type='button'
          className='admin-invite__copy'
          onClick={handleCopy}
          title={intl.formatMessage(messages.copied)}
        >
          <Icon src={iconCopy} />
        </button>
      </div>

      <div className='admin-invite__meta'>
        <span>
          <FormattedMessage
            id='admin.invites.uses'
            defaultMessage='Uses: {uses}{maxUse, select, none {} other { / {maxUse}}}'
            values={{
              uses: invite.uses,
              maxUse: invite.max_use ?? 'none',
            }}
          />
        </span>

        {invite.expires_at && (
          <span>
            <FormattedMessage id='admin.invites.expires' defaultMessage='Expires:' />{' '}
            <FormattedDate value={invite.expires_at} year='numeric' month='short' day='2-digit' />
          </span>
        )}

        {invite.used && (
          <span className='admin-invite__used'>
            <FormattedMessage id='admin.invites.used' defaultMessage='Used' />
          </span>
        )}
      </div>

      <div className='admin-invite__actions'>
        <button type='button' disabled={invite.used} onClick={handleRevoke}>
          <FormattedMessage id='admin.invites.revoke' defaultMessage='Revoke' />
        </button>
      </div>
    </div>
  );
};

const NewInviteForm: React.FC = () => {
  const intl = useIntl();

  const [maxUse, setMaxUse] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const { mutate, isPending } = useCreateInviteTokenMutation();

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    mutate(
      {
        max_use: maxUse ? Number(maxUse) : undefined,
        expires_at: expiresAt || undefined,
      },
      {
        onSuccess: () => {
          setMaxUse('');
          setExpiresAt('');
          toast.success(intl.formatMessage(messages.createSuccess));
        },
        onError: () => toast.error(intl.formatMessage(messages.createError)),
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit} className='admin-invites-page__form'>
      <Input
        type='number'
        min={1}
        placeholder={intl.formatMessage(messages.maxUsePlaceholder)}
        value={maxUse}
        onChange={(e) => setMaxUse(e.target.value)}
      />
      <Input
        type='date'
        placeholder={intl.formatMessage(messages.expiresPlaceholder)}
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
      />
      <button type='submit' disabled={isPending}>
        <FormattedMessage id='admin.invites.create' defaultMessage='Generate token' />
      </button>
    </Form>
  );
};

const EmailInviteForm: React.FC = () => {
  const intl = useIntl();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const { mutate, isPending } = useEmailInviteMutation();

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    mutate(
      { email, name: name || undefined },
      {
        onSuccess: () => {
          setEmail('');
          setName('');
          toast.success(intl.formatMessage(messages.emailSuccess));
        },
        onError: (error: any) => {
          if (error.response?.json?.error?.includes('invites_enabled')) {
            toast.error(intl.formatMessage(messages.emailErrorInvitesDisabled));
          } else {
            toast.error(intl.formatMessage(messages.emailError));
          }
        },
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit} className='admin-invites-page__form'>
      <Input
        type='email'
        required
        placeholder={intl.formatMessage(messages.emailPlaceholder)}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type='text'
        placeholder={intl.formatMessage(messages.namePlaceholder)}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type='submit' disabled={isPending || !email}>
        <FormattedMessage id='admin.invites.email.send' defaultMessage='Send e-mail invite' />
      </button>
    </Form>
  );
};

const InvitesPage: React.FC = () => {
  const intl = useIntl();

  const { data: invites, isFetching } = useInvites();

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.admin.invites'
      defaultMessage='There are no invite tokens yet.'
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='admin-invites-page'>
        <NewInviteForm />
        <EmailInviteForm />

        {invites && (
          <ScrollableList
            scrollKey='invites'
            emptyMessageText={emptyMessage}
            itemClassName='admin-invite__container'
            isLoading={isFetching}
            showLoading={isFetching && !invites?.length}
          >
            {invites.map((invite) => (
              <Invite key={invite.token} invite={invite} />
            ))}
          </ScrollableList>
        )}
      </div>
    </Column>
  );
};

export { InvitesPage as default };
