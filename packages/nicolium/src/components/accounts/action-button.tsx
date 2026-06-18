import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconProhibit from '@phosphor-icons/core/regular/prohibit.svg';
import iconTooth from '@phosphor-icons/core/regular/tooth.svg';
import iconUserMinus from '@phosphor-icons/core/regular/user-minus.svg';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';
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

import DropdownMenu, { type Menu } from '../dropdown-menu';

import type { Account } from 'pl-api';

const messages = defineMessages({
  userBit: { id: 'account.bite.success', defaultMessage: 'You have bitten @{acct}' },
  userBiteFail: { id: 'account.bite.fail', defaultMessage: 'Failed to bite @{acct}' },
  showReblogs: { id: 'account.show_reblogs', defaultMessage: 'Show reposts from @{name}' },
  showReblogsSuccess: {
    id: 'account.show_reblogs.success',
    defaultMessage: 'You will now see reposts from @{name}',
  },
  hideReblogsSuccess: {
    id: 'account.hide_reblogs.success',
    defaultMessage: 'You will no longer see reposts from @{name}',
  },
  showReblogsFail: {
    id: 'account.show_reblogs.fail',
    defaultMessage: 'Failed to enable showing reposts from @{name}',
  },
  hideReblogsFail: {
    id: 'account.hide_reblogs.fail',
    defaultMessage: 'Failed to disable showing reposts from @{name}',
  },
  subscribe: { id: 'account.subscribe', defaultMessage: 'Subscribe to notifications from @{name}' },
  subscribeSuccess: {
    id: 'account.subscribe.success',
    defaultMessage: 'You have subscribed to this account.',
  },
  unsubscribeSuccess: {
    id: 'account.unsubscribe.success',
    defaultMessage: 'You have unsubscribed from this account.',
  },
  subscribeFailure: {
    id: 'account.subscribe.fail',
    defaultMessage: 'Failed to subscribe to this account.',
  },
  unsubscribeFailure: {
    id: 'account.unsubscribe.fail',
    defaultMessage: 'Failed to unsubscribe from this account.',
  },
  notifyReblogs: {
    id: 'account.notify_reblogs',
    defaultMessage: 'Subscribe to reposts from @{name}',
  },
  notifyReblogsSuccess: {
    id: 'account.notify_reblogs.success',
    defaultMessage: 'You will now receive repost notifications from @{name}.',
  },
  notifyReblogsFailure: {
    id: 'account.notify_reblogs.failure',
    defaultMessage: 'Failed to subscribe to repost notifications from @{name}.',
  },
  notifyReblogsUnsubscribeSuccess: {
    id: 'account.notify_reblogs.unsubscribe_success',
    defaultMessage: 'You will no longer receive repost notifications from @{name}.',
  },
  notifyReblogsUnsubscribeFailure: {
    id: 'account.notify_reblogs.unsubscribe_failure',
    defaultMessage: 'Failed to unsubscribe from repost notifications from @{name}.',
  },
  notifyReplies: {
    id: 'account.notify_replies',
    defaultMessage: 'Subscribe to replies from @{name}',
  },
  notifyRepliesSuccess: {
    id: 'account.notify_replies.success',
    defaultMessage: 'You will now receive reply notifications from @{name}.',
  },
  notifyRepliesFailure: {
    id: 'account.notify_replies.failure',
    defaultMessage: 'Failed to subscribe to reply notifications from @{name}.',
  },
  notifyRepliesUnsubscribeSuccess: {
    id: 'account.notify_replies.unsubscribe_success',
    defaultMessage: 'You will no longer receive reply notifications from @{name}.',
  },
  notifyRepliesUnsubscribeFailure: {
    id: 'account.notify_replies.unsubscribe_failure',
    defaultMessage: 'Failed to unsubscribe from reply notifications from @{name}.',
  },
  unfollow: { id: 'account.unfollow', defaultMessage: 'Unfollow' },
  unfollowConfirm: { id: 'confirmations.unfollow.confirm', defaultMessage: 'Unfollow' },
});

interface IActionButton {
  /** Target account for the action. */
  account: Account;
  /** Type of action to prioritize, eg on Blocks and Mutes pages. */
  actionType?: 'muting' | 'blocking' | 'follow_request' | 'biting';
  /** Displays shorter text on the "Awaiting approval" button. */
  small?: boolean;
  /** Allow managing follow (enabling notifies etc.) from the follow button. */
  manageFollow?: boolean;
}

/**
 * Circumstantial action button (usually "Follow") to display on accounts.
 * May say "Unblock" or something else, depending on the relationship and
 * `actionType` prop.
 */
const ActionButton: React.FC<IActionButton> = ({
  account,
  actionType,
  small = true,
  manageFollow,
}) => {
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
              values={{ name: <strong>@{account.acct}</strong> }}
            />
          ),
          message: (
            <FormattedMessage
              id='confirmations.unfollow.message'
              defaultMessage='Are you sure you want to unfollow {name}?'
              values={{ name: <strong>@{account.acct}</strong> }}
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
      <button
        className={clsx(
          'account-action-button',
          isMuted ? 'account-action-button--unmute' : 'account-action-button--mute',
        )}
        type='button'
        onClick={handleMute}
      >
        {isMuted ? (
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
        )}
      </button>
    );
  };

  /** Handles actionType='blocking' */
  const blockingAction = () => {
    const isBlocked = relationship?.blocking;

    return (
      <button
        className={clsx(
          'account-action-button',
          isBlocked ? 'account-action-button--unblock' : 'account-action-button--block',
        )}
        type='button'
        onClick={handleBlock}
      >
        {isBlocked ? (
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
        )}
      </button>
    );
  };

  /** Handles actionType='blocking' */
  const bitingAction = () => {
    return (
      <button
        className='account-action-button account-action-button--bite'
        type='button'
        onClick={handleBite}
      >
        <Icon src={iconTooth} aria-hidden />
        <span>
          <FormattedMessage
            id='account.bite'
            defaultMessage='Bite @{name}'
            values={{ name: account.username }}
          />
        </span>
      </button>
    );
  };

  const followRequestAction = () => {
    return (
      <div className='follow-request-actions'>
        <button onClick={handleAuthorize}>
          <FormattedMessage id='follow_request.authorize' defaultMessage='Authorize' />
        </button>
        <button onClick={handleReject}>
          <FormattedMessage id='follow_request.reject' defaultMessage='Reject' />
        </button>
      </div>
    );
  };

  /** Render a remote follow button, depending on features. */
  const renderRemoteFollow = () => {
    // Remote follow through the API.
    if (features.remoteInteractions) {
      return (
        <button
          className='account-action-button account-action-button--remote-follow'
          type='button'
          onClick={handleRemoteFollow}
        >
          <Icon src={iconPlus} aria-hidden />
          <span>
            <FormattedMessage id='account.follow' defaultMessage='Follow' />
          </span>
        </button>
      );
      // Pleroma's classic remote follow form.
    } else if (features.pleromaRemoteFollow) {
      return (
        <form method='POST' action='/main/ostatus'>
          <input type='hidden' name='nickname' value={account.acct} />
          <input type='hidden' name='profile' value='' />
          <button
            className='account-action-button account-action-button--remote-follow'
            type='submit'
          >
            <FormattedMessage id='account.remote_follow' defaultMessage='Remote follow' />
          </button>
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
        <button
          className='account-action-button account-action-button--loading'
          type='button'
          disabled
        >
          <Spinner size={20} withText={false} />
        </button>
      );
    } else if (relationship?.requested) {
      // Awaiting acceptance
      return (
        <button
          className='account-action-button account-action-button--requested'
          type='button'
          onClick={handleFollow}
        >
          {small ? (
            <FormattedMessage id='account.requested_small' defaultMessage='Follow requested' />
          ) : (
            <FormattedMessage
              id='account.requested'
              defaultMessage='Follow requested. Click to cancel'
            />
          )}
        </button>
      );
    } else if (!relationship?.blocking && !relationship?.muting) {
      // Follow & Unfollow
      if (isFollowing && manageFollow) {
        const onReblogToggle = (reblogs: boolean) => {
          followAccount(
            { reblogs },
            {
              onSuccess: () => {
                toast.success(
                  intl.formatMessage(
                    reblogs ? messages.showReblogsSuccess : messages.hideReblogsSuccess,
                    { name: account.username },
                  ),
                );
              },
              onError: () => {
                toast.error(
                  intl.formatMessage(
                    reblogs ? messages.showReblogsFail : messages.hideReblogsFail,
                    { name: account.username },
                  ),
                );
              },
            },
          );
        };

        const onSubscribeToggle = (notify: boolean) => {
          followAccount(
            { notify },
            {
              onSuccess: () => {
                toast.success(
                  intl.formatMessage(
                    notify ? messages.subscribeSuccess : messages.unsubscribeSuccess,
                  ),
                );
              },
              onError: () => {
                toast.error(
                  intl.formatMessage(
                    notify ? messages.subscribeFailure : messages.unsubscribeFailure,
                  ),
                );
              },
            },
          );
        };

        const onNotifyReblogsToggle = (value: boolean) => {
          followAccount(
            {
              notify: true,
              notify_replies: relationship?.notifying_replies ?? false,
              notify_reblogs: value,
            },
            {
              onSuccess: () => {
                toast.success(
                  intl.formatMessage(
                    value
                      ? messages.notifyReblogsSuccess
                      : messages.notifyReblogsUnsubscribeSuccess,
                    { name: account.username },
                  ),
                );
              },
              onError: () => {
                toast.error(
                  intl.formatMessage(
                    value
                      ? messages.notifyReblogsFailure
                      : messages.notifyReblogsUnsubscribeFailure,
                    { name: account.username },
                  ),
                );
              },
            },
          );
        };

        const onNotifyRepliesToggle = (value: boolean) => {
          followAccount(
            {
              notify: true,
              notify_reblogs: relationship?.notifying_reblogs ?? false,
              notify_replies: value,
            },
            {
              onSuccess: () => {
                toast.success(
                  intl.formatMessage(
                    value
                      ? messages.notifyRepliesSuccess
                      : messages.notifyRepliesUnsubscribeSuccess,
                    { name: account.username },
                  ),
                );
              },
              onError: () => {
                toast.error(
                  intl.formatMessage(
                    value
                      ? messages.notifyRepliesFailure
                      : messages.notifyRepliesUnsubscribeFailure,
                    { name: account.username },
                  ),
                );
              },
            },
          );
        };

        const items: Menu = [
          {
            text: intl.formatMessage(messages.showReblogs, { name: account.username }),
            type: 'toggle',
            checked: relationship?.showing_reblogs,
            onChange: onReblogToggle,
          },
        ];

        if (features.accountNotifies) {
          items.push({
            text: intl.formatMessage(messages.subscribe, { name: account.username }),
            type: 'toggle',
            checked: relationship?.notifying,
            onChange: onSubscribeToggle,
          });
        }

        if (features.accountNotifiesControl) {
          items.push(
            {
              text: intl.formatMessage(messages.notifyReblogs, { name: account.username }),
              type: 'toggle',
              checked: relationship?.notifying_reblogs,
              disabled: !relationship?.notifying,
              onChange: onNotifyReblogsToggle,
            },
            {
              text: intl.formatMessage(messages.notifyReplies, { name: account.username }),
              type: 'toggle',
              checked: relationship?.notifying_replies,
              disabled: !relationship?.notifying,
              onChange: onNotifyRepliesToggle,
            },
          );
        }

        items.push(null, {
          text: intl.formatMessage(messages.unfollow),
          icon: iconUserMinus,
          action: handleFollow,
          destructive: true,
        });

        return (
          <DropdownMenu items={items}>
            <button
              className='account-action-button account-action-button--following'
              type='button'
            >
              <span>
                <FormattedMessage id='account.following' defaultMessage='Following' />
              </span>
              <Icon src={iconCaretDown} aria-hidden />
            </button>
          </DropdownMenu>
        );
      }
      const followIcon = blockedBy ? iconProhibit : !isFollowing ? iconPlus : undefined;

      return (
        <button
          className={clsx(
            'account-action-button',
            isFollowing ? 'account-action-button--unfollow' : 'account-action-button--follow',
          )}
          type='button'
          disabled={blockedBy || isPendingFollow || isPendingUnfollow}
          onClick={handleFollow}
        >
          {followIcon ? <Icon src={followIcon} aria-hidden /> : null}
          <span>
            {isFollowing ? (
              <FormattedMessage id='account.unfollow' defaultMessage='Unfollow' />
            ) : blockedBy ? (
              <FormattedMessage id='account.blocked' defaultMessage='Blocked' />
            ) : account.locked ? (
              <FormattedMessage id='account.request_follow' defaultMessage='Request follow' />
            ) : (
              <FormattedMessage id='account.follow' defaultMessage='Follow' />
            )}
          </span>
        </button>
      );
    } else if (relationship?.blocking) {
      // Unblock
      return (
        <button
          className='account-action-button account-action-button--unblock'
          type='button'
          onClick={handleBlock}
        >
          <FormattedMessage
            id='account.unblock'
            defaultMessage='Unblock @{name}'
            values={{ name: account.username }}
          />
        </button>
      );
    }
  } else {
    // Edit profile
    return (
      <Link className='account-action-button account-action-button--edit' to='/settings/profile'>
        <FormattedMessage id='account.edit_profile' defaultMessage='Edit profile' />
      </Link>
    );
  }

  return null;
};

export { ActionButton as default };
