import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from '@/components/ui/button';
import HStack from '@/components/ui/hstack';
import Spinner from '@/components/ui/spinner';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useAcceptFollowRequestMutation, useRejectFollowRequestMutation } from '@/queries/accounts/use-follow-requests';
import {
  useRelationshipQuery,
  useUnblockAccountMutation,
  useMuteAccountMutation,
  useUnmuteAccountMutation,
  useFollowAccountMutation,
  useUnfollowAccountMutation,
} from '@/queries/accounts/use-relationship';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import type { Account } from 'pl-api';

const messages = defineMessages({
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  blocked: { id: 'account.blocked', defaultMessage: 'Blocked' },
  edit_profile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
  follow: { id: 'account.follow', defaultMessage: 'Follow' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  remote_follow: { id: 'account.remote_follow', defaultMessage: 'Remote follow' },
  requested: { id: 'account.requested', defaultMessage: 'Follow requested. Click to cancel' },
  requested_small: { id: 'account.requested_small', defaultMessage: 'Follow requested' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  unfollow: { id: 'account.unfollow', defaultMessage: 'Unfollow' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  authorize: { id: 'follow_request.authorize', defaultMessage: 'Authorize' },
  reject: { id: 'follow_request.reject', defaultMessage: 'Reject' },
  bite: { id: 'account.bite', defaultMessage: 'Bite @{name}' },
  userBit: { id: 'account.bite.success', defaultMessage: 'You have bit @{acct}' },
  userBiteFail: { id: 'account.bite.fail', defaultMessage: 'Failed to bite @{acct}' },
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

  const { openModal } = useModalsActions();
  const { isLoggedIn, me } = useLoggedIn();

  const { mutate: followAccount, isPending: isPendingFollow } = useFollowAccountMutation(account.id);
  const { mutate: unfollowAccount, isPending: isPendingUnfollow } = useUnfollowAccountMutation(account.id);
  const { mutate: unblockAccount } = useUnblockAccountMutation(account.id);
  const { mutate: muteAccount } = useMuteAccountMutation(account.id);
  const { mutate: unmuteAccount } = useUnmuteAccountMutation(account.id);

  const { data: relationship, isLoading } = useRelationshipQuery(account.id);

  const { mutate: authorizeFollowRequest } = useAcceptFollowRequestMutation(account.id);
  const { mutate: rejectFollowRequest } = useRejectFollowRequestMutation(account.id);

  const handleFollow = () => {
    if (relationship?.following || relationship?.requested) {
      unfollowAccount();
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
    client.accounts.biteAccount(account.id)
      .then(() =>{
        toast.success(intl.formatMessage(messages.userBit, { acct: account.acct }));
      })
      .catch(() =>{
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
    const messageKey = isMuted ? messages.unmute : messages.mute;
    const text = intl.formatMessage(messageKey, { name: account.username });

    return (
      <Button
        theme={isMuted ? 'danger' : 'secondary'}
        size='sm'
        text={text}
        onClick={handleMute}
      />
    );
  };

  /** Handles actionType='blocking' */
  const blockingAction = () => {
    const isBlocked = relationship?.blocking;
    const messageKey = isBlocked ? messages.unblock : messages.block;
    const text = intl.formatMessage(messageKey, { name: account.username });

    return (
      <Button
        theme={isBlocked ? 'danger' : 'secondary'}
        size='sm'
        text={text}
        onClick={handleBlock}
      />
    );
  };

  /** Handles actionType='blocking' */
  const bitingAction = () => {
    const text = intl.formatMessage(messages.bite, { name: account.username });

    return (
      <Button
        theme='secondary'
        size='sm'
        text={text}
        onClick={handleBite}
        icon={require('@phosphor-icons/core/regular/tooth.svg')}
      />
    );
  };

  const followRequestAction = () => {
    return (
      <HStack space={2}>
        <Button
          theme='secondary'
          size='sm'
          text={intl.formatMessage(messages.authorize)}
          onClick={handleAuthorize}
        />
        <Button
          theme='danger'
          size='sm'
          text={intl.formatMessage(messages.reject)}
          onClick={handleReject}
        />
      </HStack>
    );
  };

  /** Render a remote follow button, depending on features. */
  const renderRemoteFollow = () => {
    // Remote follow through the API.
    if (features.remoteInteractions) {
      return (
        <Button
          onClick={handleRemoteFollow}
          icon={require('@phosphor-icons/core/regular/plus.svg')}
          text={intl.formatMessage(messages.follow)}
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
            text={intl.formatMessage(messages.remote_follow)}
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
          text={small ? intl.formatMessage(messages.requested_small) : intl.formatMessage(messages.requested)}
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
          icon={blockedBy ? require('@phosphor-icons/core/regular/prohibit.svg') : (!isFollowing && require('@phosphor-icons/core/regular/plus.svg'))}
          onClick={handleFollow}
        >
          {isFollowing ? (
            intl.formatMessage(messages.unfollow)
          ) : (
            intl.formatMessage(blockedBy ? messages.blocked : messages.follow)
          )}
        </Button>
      );
    } else if (relationship?.blocking) {
      // Unblock
      return (
        <Button
          theme='danger'
          size='sm'
          text={intl.formatMessage(messages.unblock, { name: account.username })}
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
        text={intl.formatMessage(messages.edit_profile)}
        to='/settings/profile'
      />
    );
  }

  return null;
};

export { ActionButton as default };
