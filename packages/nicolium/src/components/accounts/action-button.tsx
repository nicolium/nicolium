import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import iconTooth from '@phosphor-icons/core/regular/tooth.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Button from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import {
  useAcceptFollowRequestMutation,
  useRejectFollowRequestMutation,
} from '@/queries/accounts/use-follow-requests';
import {
  useRelationshipQuery,
  useUnblockAccountMutation,
  useMuteAccountMutation,
  useUnmuteAccountMutation,
  useFollowAccountMutation,
  useUnfollowAccountMutation,
} from '@/queries/accounts/use-relationship';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';

import type { Account } from 'pl-api';

const messages = defineMessages({
  userBit: { id: 'account.bite.success', defaultMessage: 'You have bit @{acct}' },
  userBiteFail: { id: 'account.bite.fail', defaultMessage: 'Failed to bite @{acct}' },
  unfollowConfirm: { id: 'confirmations.unfollow.confirm', defaultMessage: 'Unfollow' },
});

interface IActionButton {
  /** Target account for the action. */
  account: Account;
  /** Type of action to prioritize, eg on Blocks and Mutes pages. */
  actionType?: 'muting' | 'blocking' | 'follow_request' | 'biting';
  /** Displays shorter text on the "Awaiting approval" button. */
  small?: boolean;
}

/**
 * Circumstantial action button (usually "Follow") to display on accounts.
 * May say "Unblock" or something else, depending on the relationship and
 * `actionType` prop.
 */
const ActionButton: React.FC<IActionButton> = ({ account, actionType, small = true }) => {
  const features = useFeatures();
  const intl = useIntl();
  const client = useClient();
  const settings = useSettings();

  const { openModal } = useModalsActions();
  const { isLoggedIn, me } = useLoggedIn();

  const { mutate: followAccount, isPending: isPendingFollow } = useFollowAccountMutation(
    account.id,
  );
  const { mutate: unfollowAccount, isPending: isPendingUnfollow } = useUnfollowAccountMutation(
    account.id,
  );
  const { mutate: unblockAccount } = useUnblockAccountMutation(account.id);
  const { mutate: muteAccount } = useMuteAccountMutation(account.id);
  const { mutate: unmuteAccount } = useUnmuteAccountMutation(account.id);

  const { data: relationship, isLoading } = useRelationshipQuery(account.id);

  const { mutate: authorizeFollowRequest } = useAcceptFollowRequestMutation(account.id);
  const { mutate: rejectFollowRequest } = useRejectFollowRequestMutation(account.id);

  const handleFollow = () => {
    if (relationship?.following || relationship?.requested) {
      if (settings.unfollowModal) {
        openModal('CONFIRM', {
          heading: (
            <FormattedMessage
              id='confirmations.unfollow.heading'
              defaultMessage='Unfollow {name}'
              values={{ name: <strong className='break-words'>@{account.acct}</strong> }}
            />
          ),
          message: (
            <FormattedMessage
              id='confirmations.unfollow.message'
              defaultMessage='Are you sure you want to unfollow {name}?'
              values={{ name: <strong className='break-words'>@{account.acct}</strong> }}
            />
          ),
          confirm: intl.formatMessage(messages.unfollowConfirm),
          onConfirm: () => {
            unfollowAccount();
          },
        });
      } else {
        unfollowAccount();
      }
    } else {
      followAccount(undefined);
    }
  };

  const handleBlock = () => {
    if (relationship?.blocking) {
      unblockAccount();
    } else {
      openModal('BLOCK_MUTE', { accountId: account.id, action: 'BLOCK' });
    }
  };

  const handleMute = () => {
    if (relationship?.muting) {
      unmuteAccount();
    } else {
      muteAccount(undefined);
    }
  };

  const handleAuthorize = () => {
    authorizeFollowRequest();
  };

  const handleReject = () => {
    rejectFollowRequest();
  };

  const handleBite = () => {
    client.accounts
      .biteAccount(account.id)
      .then(() => {
        toast.success(intl.formatMessage(messages.userBit, { acct: account.acct }));
      })
      .catch(() => {
        toast.error(intl.formatMessage(messages.userBiteFail, { acct: account.acct }));
      });
  };

  const handleRemoteFollow = () => {
    openModal('UNAUTHORIZED', {
      action: 'FOLLOW',
      account: account.id,
      ap_id: account.url,
    });
  };

  /** Handles actionType='muting' */
  const mutingAction = () => {
    const isMuted = relationship?.muting;

    return (
      <Button
        theme={isMuted ? 'danger' : 'secondary'}
        size='sm'
        text={
          isMuted ? (
            <FormattedMessage
              id='account.unmute'
              defaultMessage='Unmute @{name}'
              values={{ name: account.username }}
            />
          ) : (
            <FormattedMessage
              id='account.mute'
              defaultMessage='Mute @{name}'
              values={{ name: account.username }}
            />
          )
        }
        onClick={handleMute}
      />
    );
  };

  /** Handles actionType='blocking' */
  const blockingAction = () => {
    const isBlocked = relationship?.blocking;

    return (
      <Button
        theme={isBlocked ? 'danger' : 'secondary'}
        size='sm'
        text={
          isBlocked ? (
            <FormattedMessage
              id='account.unblock'
              defaultMessage='Unblock @{name}'
              values={{ name: account.username }}
            />
          ) : (
            <FormattedMessage
              id='account.block'
              defaultMessage='Block @{name}'
              values={{ name: account.username }}
            />
          )
        }
        onClick={handleBlock}
      />
    );
  };

  /** Handles actionType='blocking' */
  const bitingAction = () => {
    return (
      <Button
        theme='secondary'
        size='sm'
        text={
          <FormattedMessage
            id='account.bite'
            defaultMessage='Bite @{name}'
            values={{ name: account.username }}
          />
        }
        onClick={handleBite}
        icon={iconTooth}
      />
    );
  };

  const followRequestAction = () => {
    return (
      <div className='flex gap-2'>
        <Button
          theme='secondary'
          size='sm'
          text={<FormattedMessage id='follow_request.authorize' defaultMessage='Authorize' />}
          onClick={handleAuthorize}
        />
        <Button
          theme='danger'
          size='sm'
          text={<FormattedMessage id='follow_request.reject' defaultMessage='Reject' />}
          onClick={handleReject}
        />
      </div>
    );
  };

  /** Render a remote follow button, depending on features. */
  const renderRemoteFollow = () => {
    // Remote follow through the API.
    if (features.remoteInteractions) {
      return (
        <Button
          onClick={handleRemoteFollow}
          icon={iconPlus}
          text={<FormattedMessage id='account.follow' defaultMessage='Follow' />}
          size='sm'
        />
      );
      // Pleroma's classic remote follow form.
    } else if (features.pleromaRemoteFollow) {
      return (
        <form method='POST' action='/main/ostatus'>
          <input type='hidden' name='nickname' value={account.acct} />
          <input type='hidden' name='profile' value='' />
          <Button
            text={<FormattedMessage id='account.remote_follow' defaultMessage='Remote follow' />}
            type='submit'
            size='sm'
          />
        </form>
      );
    }

    return null;
  };

  /** Render remote follow if federating, otherwise hide the button. */
  const renderLoggedOut = () => {
    if (features.federating) {
      return renderRemoteFollow();
    }

    return null;
  };

  if (!isLoggedIn) {
    return renderLoggedOut();
  }

  if (me !== account.id) {
    const isFollowing = relationship?.following;
    const blockedBy = relationship?.blocked_by as boolean;

    if (actionType) {
      if (actionType === 'muting') {
        return mutingAction();
      } else if (actionType === 'blocking') {
        return blockingAction();
      } else if (actionType === 'follow_request' && !relationship?.followed_by) {
        return followRequestAction();
      } else if (actionType === 'biting') {
        return bitingAction();
      }
    }

    if (!relationship && !isLoading) return null;

    if (!relationship) {
      return (
        <Button
          size='xs'
          theme='primary'
          className='px-4'
          disabled
          text={<Spinner size={20} withText={false} />}
        />
      );
    } else if (relationship?.requested) {
      // Awaiting acceptance
      return (
        <Button
          size='sm'
          theme='tertiary'
          text={
            small ? (
              <FormattedMessage id='account.requested_small' defaultMessage='Follow requested' />
            ) : (
              <FormattedMessage
                id='account.requested'
                defaultMessage='Follow requested. Click to cancel'
              />
            )
          }
          onClick={handleFollow}
        />
      );
    } else if (!relationship?.blocking && !relationship?.muting) {
      // Follow & Unfollow
      return (
        <Button
          size='sm'
          disabled={blockedBy || isPendingFollow || isPendingUnfollow}
          theme={isFollowing ? 'secondary' : 'primary'}
          icon={blockedBy ? iconProhibit : !isFollowing ? iconPlus : undefined}
          onClick={handleFollow}
        >
          {isFollowing ? (
            <FormattedMessage id='account.unfollow' defaultMessage='Unfollow' />
          ) : blockedBy ? (
            <FormattedMessage id='account.blocked' defaultMessage='Blocked' />
          ) : (
            <FormattedMessage id='account.follow' defaultMessage='Follow' />
          )}
        </Button>
      );
    } else if (relationship?.blocking) {
      // Unblock
      return (
        <Button
          theme='danger'
          size='sm'
          text={
            <FormattedMessage
              id='account.unblock'
              defaultMessage='Unblock @{name}'
              values={{ name: account.username }}
            />
          }
          onClick={handleBlock}
        />
      );
    }
  } else {
    // Edit profile
    return (
      <Button
        theme='tertiary'
        size='sm'
        text={<FormattedMessage id='account.edit_profile' defaultMessage='Edit profile' />}
        to='/settings/profile'
      />
    );
  }

  return null;
};

export { ActionButton as default };
