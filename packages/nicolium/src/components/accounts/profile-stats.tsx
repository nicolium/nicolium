import { Link } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useCurrentAccount } from '@/contexts/current-account-context';
import { useSettings } from '@/stores/settings';
import { shortNumberFormat } from '@/utils/numbers';

import type { Account } from 'pl-api';

const messages = defineMessages({
  statusesCount: {
    id: 'account.statuses_count',
    defaultMessage: '{count, plural, one {# post} other {# posts}}',
  },
  followersCount: {
    id: 'account.followers_count',
    defaultMessage: '{count, plural, one {# follower} other {# followers}}',
  },
  followingCount: { id: 'account.following_count', defaultMessage: '{count} following' },
  subscribersCount: {
    id: 'account.subscribers_count',
    defaultMessage: '{count, plural, one {# subscriber} other {# subscribers}}',
  },
});

interface IProfileStats {
  account:
    | Pick<
        Account,
        | 'acct'
        | 'followers_count'
        | 'following_count'
        | 'hide_followers'
        | 'hide_followers_count'
        | 'hide_follows'
        | 'hide_follows_count'
        | 'id'
        | 'statuses_count'
        | 'subscribers_count'
      >
    | undefined;
  onClickHandler?: React.MouseEventHandler;
  withStatusesLink?: boolean;
}

/** Display follower and following counts for an account. */
const ProfileStats: React.FC<IProfileStats> = ({ account, onClickHandler, withStatusesLink }) => {
  const intl = useIntl();
  const { demetricator } = useSettings();
  const me = useCurrentAccount();

  const ownAccount = account?.id === me;

  if (!account) {
    return null;
  }

  const showFollowers = ownAccount || !account.hide_followers_count || !account.hide_followers;
  const showFollowing = ownAccount || !account.hide_follows_count || !account.hide_follows;

  const StatusesComponent = withStatusesLink ? Link : 'div';
  const FollowersComponent = !account.hide_followers || ownAccount ? Link : 'div';
  const FollowingComponent = !account.hide_follows || ownAccount ? Link : 'div';

  return (
    <div className='⁂-account-stats'>
      {!demetricator && (
        <StatusesComponent
          to='/@{$username}'
          params={{ username: account.acct }}
          onClick={onClickHandler}
          title={intl.formatMessage(messages.statusesCount, { count: account.statuses_count })}
        >
          <strong>{shortNumberFormat(account.statuses_count)}</strong>
          <FormattedMessage id='account.statuses' defaultMessage='Posts' />
        </StatusesComponent>
      )}

      {showFollowers ? (
        <FollowersComponent
          to='/@{$username}/followers'
          params={{ username: account.acct }}
          onClick={onClickHandler}
          title={intl.formatMessage(messages.followersCount, { count: account.followers_count })}
        >
          {!demetricator && !(account.hide_followers_count && !ownAccount) && (
            <strong>{shortNumberFormat(account.followers_count)}</strong>
          )}

          <FormattedMessage id='account.followers' defaultMessage='Followers' />
        </FollowersComponent>
      ) : (
        <div>
          <FormattedMessage id='account.followers.hidden' defaultMessage='Followers hidden' />
        </div>
      )}

      {showFollowing ? (
        <FollowingComponent
          to='/@{$username}/following'
          params={{ username: account.acct }}
          onClick={onClickHandler}
          title={intl.formatMessage(messages.followingCount, { count: account.following_count })}
        >
          {!demetricator && !(account.hide_follows_count && !ownAccount) && (
            <strong>{shortNumberFormat(account.following_count)}</strong>
          )}

          <FormattedMessage id='account.follows' defaultMessage='Following' />
        </FollowingComponent>
      ) : (
        <div>
          <FormattedMessage id='account.following.hidden' defaultMessage='Follows hidden' />
        </div>
      )}

      {account.subscribers_count > 0 && (
        <Link
          to='/@{$username}/subscribers'
          params={{ username: account.acct }}
          onClick={onClickHandler}
          title={intl.formatMessage(messages.subscribersCount, {
            count: account.subscribers_count,
          })}
        >
          {!demetricator && <strong>{shortNumberFormat(account.subscribers_count)}</strong>}

          <FormattedMessage id='account.subscribers' defaultMessage='Subscribers' />
        </Link>
      )}
    </div>
  );
};

export { ProfileStats as default };
