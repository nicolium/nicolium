import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import HStack from '@/components/ui/hstack';
import Text from '@/components/ui/text';
import { useSettings } from '@/stores/settings';
import { shortNumberFormat } from '@/utils/numbers';

import type { Account } from 'pl-api';

interface IProfileStats {
  account: Pick<Account, 'acct' | 'followers_count' | 'following_count' | 'statuses_count' | 'subscribers_count'> | undefined;
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
    <HStack alignItems='center' className='gap-x-3' wrap>
      {!demetricator && (
        <HStack alignItems='center' space={1}>
          <Text theme='primary' weight='bold' size='sm'>
            {shortNumberFormat(account.statuses_count)}
          </Text>
          <Text weight='bold' size='sm'>
            <FormattedMessage id='account.statuses' defaultMessage='Statuses' />
          </Text>
        </HStack>
      )}

      <Link to='/@{$username}/followers' params={{ username: account.acct }} onClick={onClickHandler} title={intl.formatNumber(account.followers_count)} className='hover:underline'>
        <HStack alignItems='center' space={1}>
          {!demetricator && (
            <Text theme='primary' weight='bold' size='sm'>
              {shortNumberFormat(account.followers_count)}
            </Text>
          )}
          <Text weight='bold' size='sm'>
            <FormattedMessage id='account.followers' defaultMessage='Followers' />
          </Text>
        </HStack>
      </Link>

      <Link to='/@{$username}/following' params={{ username: account.acct }} onClick={onClickHandler} title={intl.formatNumber(account.following_count)} className='hover:underline'>
        <HStack alignItems='center' space={1}>
          {!demetricator && (
            <Text theme='primary' weight='bold' size='sm'>
              {shortNumberFormat(account.following_count)}
            </Text>
          )}
          <Text weight='bold' size='sm'>
            <FormattedMessage id='account.follows' defaultMessage='Following' />
          </Text>
        </HStack>
      </Link>

      {account.subscribers_count > 0 && (
        // <Link to='/@{$username}/subscribers' params={{ username: account.acct }} onClick={onClickHandler} title={intl.formatNumber(account.subscribers_count)} className='hover:underline'>
        <HStack alignItems='center' space={1}>
          {!demetricator && (
            <Text theme='primary' weight='bold' size='sm'>
              {shortNumberFormat(account.subscribers_count)}
            </Text>
          )}
          <Text weight='bold' size='sm'>
            <FormattedMessage id='account.subscribers' defaultMessage='Subscribers' />
          </Text>
        </HStack>
        // </Link>
      )}
    </HStack>
  );
};

export { ProfileStats as default };
