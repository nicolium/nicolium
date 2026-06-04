import { useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Form from '@/components/ui/form';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useRegistrationStatus } from '@/hooks/use-registration-status';
import { useAccount } from '@/queries/accounts/use-account';
import { useInstance } from '@/stores/instance';
import toast from '@/toast';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  accountPlaceholder: {
    id: 'remote_interaction.account.placeholder',
    defaultMessage: 'Enter the username@domain you want to act from',
  },
  userNotFoundError: {
    id: 'remote_interaction.user_not_found.error',
    defaultMessage: 'Couldn’t find given user',
  },
});

type UnauthorizedModalAction =
  | 'FOLLOW'
  | 'REPLY'
  | 'REBLOG'
  | 'FAVOURITE'
  | 'DISLIKE'
  | 'POLL_VOTE'
  | 'JOIN';

interface UnauthorizedModalProps {
  /** Unauthorized action type. */
  action?: UnauthorizedModalAction;
  /** ActivityPub ID of the account OR status being acted upon. */
  ap_id?: string;
  /** Account ID of the account being acted upon. */
  account?: string;
}

/** Modal to display when a logged-out user tries to do something that requires login. */
const UnauthorizedModal: React.FC<UnauthorizedModalProps & BaseModalProps> = ({
  action,
  onClose,
  account: accountId,
  ap_id: apId,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();
  const client = useClient();
  const { data: account } = useAccount(accountId || undefined, false);

  const username = account?.display_name;
  const features = useFeatures();

  const [remoteAccount, setRemoteAccount] = useState('');

  const onAccountChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setRemoteAccount(e.target.value);
  };

  const onClickClose = () => {
    onClose('UNAUTHORIZED');
  };

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    client.accounts
      .remoteInteraction(apId!, remoteAccount)
      .then(({ url }) => {
        window.open(url, '_new', 'noopener,noreferrer');
        onClose('UNAUTHORIZED');
      })
      .catch((error) => {
        if (error.message === "Couldn't find user") {
          toast.error(intl.formatMessage(messages.userNotFoundError));
        }
      });
  };

  const onLogin = () => {
    navigate({ to: '/login' });
    onClickClose();
  };

  const onRegister = () => {
    navigate({ to: '/signup' });
    onClickClose();
  };

  const renderRemoteInteractions = () => {
    let header;
    let button;

    if (action === 'FOLLOW') {
      header = (
        <FormattedMessage
          id='remote_interaction.follow.title'
          defaultMessage='Follow {user} remotely'
          values={{ user: username }}
        />
      );
      button = (
        <FormattedMessage id='remote_interaction.follow' defaultMessage='Proceed to follow' />
      );
    } else if (action === 'REPLY') {
      header = (
        <FormattedMessage
          id='remote_interaction.reply.title'
          defaultMessage='Reply to a post remotely'
        />
      );
      button = <FormattedMessage id='remote_interaction.reply' defaultMessage='Proceed to reply' />;
    } else if (action === 'REBLOG') {
      header = (
        <FormattedMessage
          id='remote_interaction.reblog.title'
          defaultMessage='Repost a post remotely'
        />
      );
      button = (
        <FormattedMessage id='remote_interaction.reblog' defaultMessage='Proceed to repost' />
      );
    } else if (action === 'FAVOURITE') {
      header = (
        <FormattedMessage
          id='remote_interaction.favourite.title'
          defaultMessage='Like a post remotely'
        />
      );
      button = (
        <FormattedMessage id='remote_interaction.favourite' defaultMessage='Proceed to like' />
      );
    } else if (action === 'DISLIKE') {
      header = (
        <FormattedMessage
          id='remote_interaction.dislike.title'
          defaultMessage='Dislike a post remotely'
        />
      );
      button = (
        <FormattedMessage id='remote_interaction.dislike' defaultMessage='Proceed to dislike' />
      );
    } else if (action === 'POLL_VOTE') {
      header = (
        <FormattedMessage
          id='remote_interaction.poll_vote.title'
          defaultMessage='Vote in a poll remotely'
        />
      );
      button = (
        <FormattedMessage id='remote_interaction.poll_vote' defaultMessage='Proceed to vote' />
      );
    } else if (action === 'JOIN') {
      header = (
        <FormattedMessage
          id='remote_interaction.event_join.title'
          defaultMessage='Join an event remotely'
        />
      );
      button = (
        <FormattedMessage id='remote_interaction.event_join' defaultMessage='Proceed to join' />
      );
    }

    return (
      <Modal
        title={header}
        onClose={onClickClose}
        confirmationAction={onLogin}
        confirmationText={<FormattedMessage id='account.login' defaultMessage='Log in' />}
        secondaryAction={isOpen ? onRegister : undefined}
        secondaryText={
          isOpen ? <FormattedMessage id='account.register' defaultMessage='Sign up' /> : undefined
        }
      >
        <div className='unauthorized-modal'>
          <Form onSubmit={onSubmit}>
            <Input
              placeholder={intl.formatMessage(messages.accountPlaceholder)}
              name='remote_follow[acct]'
              value={remoteAccount}
              autoCorrect='off'
              autoCapitalize='off'
              onChange={onAccountChange}
              required
            />
            <button type='submit'>{button}</button>
          </Form>
          <div className={'unauthorized-modal__divider'}>
            <FormattedMessage id='remote_interaction.divider' defaultMessage='or' />
          </div>
          {isOpen && (
            <p className='unauthorized-modal__title'>
              <FormattedMessage
                id='unauthorized_modal.title'
                defaultMessage='Sign up for {site_title}'
                values={{ site_title: instance.title }}
              />
            </p>
          )}
        </div>
      </Modal>
    );
  };

  if (action && features.remoteInteractions && features.federating) {
    return renderRemoteInteractions();
  }

  return (
    <Modal
      title={
        <FormattedMessage
          id='unauthorized_modal.title'
          defaultMessage='Sign up for {site_title}'
          values={{ site_title: instance.title }}
        />
      }
      onClose={onClickClose}
      confirmationAction={onLogin}
      confirmationText={<FormattedMessage id='account.login' defaultMessage='Log in' />}
      secondaryAction={isOpen ? onRegister : undefined}
      secondaryText={
        isOpen ? <FormattedMessage id='account.register' defaultMessage='Sign up' /> : undefined
      }
    >
      <div className='unauthorized-modal'>
        <p className='unauthorized-modal__text'>
          <FormattedMessage
            id='unauthorized_modal.text'
            defaultMessage='You need to be logged in to do that.'
          />
        </p>
      </div>
    </Modal>
  );
};

export { type UnauthorizedModalAction, type UnauthorizedModalProps, UnauthorizedModal as default };
