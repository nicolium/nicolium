import { Link } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Text from '@/components/ui/text';
import { useSettings } from '@/stores/settings';
import { shortNumberFormat } from '@/utils/numbers';

import type { Account } from 'pl-api';

const messages = defineMessages({
  statusesCount: {
    id: 'account.statuses_count',
    defaultMessage: '{count, plural, one {# status} other {# statuses}}',
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
        'acct' | 'followers_count' | 'following_count' | 'statuses_count' | 'subscribers_count'
      >
    | undefined;
  onClickHandler?: React.MouseEventHandler;
}

/** Display follower and following counts for an account. */
const ProfileStats: React.FC<IProfileStats> = ({ account, onClickHandler }) => {
  const intl = useIntl();
  const { demetricator } = useSettings();

  if (!account) {
    return null;
  }

  return (
    <div className='flex flex-wrap items-center gap-x-3'>
      {!demetricator && (
        <div
          className='flex items-center gap-1'
          title={intl.formatMessage(messages.statusesCount, { count: account.statuses_count })}
        >
          <Text theme='primary' weight='bold' size='sm'>
            {shortNumberFormat(account.statuses_count)}
          </Text>
          <Text weight='bold' size='sm'>
            <FormattedMessage id='account.statuses' defaultMessage='Statuses' />
          </Text>
        </div>
      )}

      <Link
        to='/@{$username}/followers'
        params={{ username: account.acct }}
        onClick={onClickHandler}
        title={intl.formatNumber(account.followers_count)}
        className='hover:underline'
      >
        <div
          className='flex items-center gap-1'
          title={intl.formatMessage(messages.followersCount, { count: account.followers_count })}
        >
          {!demetricator && (
            <Text theme='primary' weight='bold' size='sm'>
              {shortNumberFormat(account.followers_count)}
            </Text>
          )}
          <Text weight='bold' size='sm'>
            <FormattedMessage id='account.followers' defaultMessage='Followers' />
          </Text>
        </div>
      </Link>

      <Link
        to='/@{$username}/following'
        params={{ username: account.acct }}
        onClick={onClickHandler}
        title={intl.formatNumber(account.following_count)}
        className='hover:underline'
      >
        <div
          className='flex items-center gap-1'
          title={intl.formatMessage(messages.followingCount, { count: account.following_count })}
        >
          {!demetricator && (
            <Text theme='primary' weight='bold' size='sm'>
              {shortNumberFormat(account.following_count)}
            </Text>
          )}
          <Text weight='bold' size='sm'>
            <FormattedMessage id='account.follows' defaultMessage='Following' />
          </Text>
        </div>
      </Link>

      {account.subscribers_count > 0 && (
        <Link
          to='/@{$username}/subscribers'
          params={{ username: account.acct }}
          onClick={onClickHandler}
          title={intl.formatNumber(account.subscribers_count)}
          className='hover:underline'
        >
          <div
            className='flex items-center gap-1'
            title={intl.formatMessage(messages.subscribersCount, {
              count: account.subscribers_count,
            })}
          >
            {!demetricator && (
              <Text theme='primary' weight='bold' size='sm'>
                {shortNumberFormat(account.subscribers_count)}
              </Text>
            )}
            <Text weight='bold' size='sm'>
              <FormattedMessage id='account.subscribers' defaultMessage='Subscribers' />
            </Text>
          </div>
        </Link>
      )}
    </div>
  );
};

export { ProfileStats as default };
