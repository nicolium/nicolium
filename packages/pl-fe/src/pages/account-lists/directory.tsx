import { Link, useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useAccount } from '@/api/hooks/accounts/use-account';
import Account from '@/components/account';
import Badge from '@/components/badge';
import HoverAccountWrapper from '@/components/hover-account-wrapper';
import LoadMore from '@/components/load-more';
import { ParsedContent } from '@/components/parsed-content';
import { RadioGroup, RadioItem } from '@/components/radio';
import RelativeTimestamp from '@/components/relative-timestamp';
import StillImage from '@/components/still-image';
import Avatar from '@/components/ui/avatar';
import { CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import ActionButton from '@/features/ui/components/action-button';
import { directoryRoute } from '@/features/ui/router';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useFeatures } from '@/hooks/use-features';
import { useInstance } from '@/hooks/use-instance';
import { useDirectory } from '@/queries/accounts/use-directory';
import { shortNumberFormat } from '@/utils/numbers';

const messages = defineMessages({
  title: { id: 'column.directory', defaultMessage: 'Profile directory' },
  recentlyActive: { id: 'directory.recently_active', defaultMessage: 'Recently active' },
  newArrivals: { id: 'directory.new_arrivals', defaultMessage: 'New arrivals' },
  local: { id: 'directory.local', defaultMessage: 'From {domain} only' },
  federated: { id: 'directory.federated', defaultMessage: 'From known fediverse' },
});

interface IAccountCard {
  id: string;
}

const AccountCard: React.FC<IAccountCard> = ({ id }) => {
  const me = useAppSelector((state) => state.me);
  const { account } = useAccount(id);

  if (!account) return null;

  const followedBy = me !== account.id && account.relationship?.followed_by;

  return (
    <div className='flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow dark:divide-primary-700 dark:bg-primary-800'>
      <div className='relative'>
        {followedBy && (
          <div className='absolute left-2.5 top-2.5'>
            <Badge
              slug='opaque'
              title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
            />
          </div>
        )}

        <div className='absolute bottom-0 right-3 translate-y-1/2'>
          <ActionButton account={account} small />
        </div>

        {account.header ? (
          <StillImage
            src={account.header}
            staticSrc={account.header_static}
            alt={account.header_description}
            className='block h-32 w-full rounded-t-lg object-cover'
          />
        ) : (
          <div className='h-32 w-full rounded-t-lg bg-gray-200 dark:bg-gray-700' />
        )}

        <Link to='/@{$username}' params={{ username: account.acct }} title={account.acct}>
          <HoverAccountWrapper key={account.id} accountId={account.id} element='span'>
            <Avatar
              src={account.avatar}
              alt={account.avatar_description}
              className='!absolute bottom-0 left-3 translate-y-1/2 bg-white ring-2 ring-white dark:bg-primary-900 dark:ring-primary-900'
              size={64}
              isCat={account.is_cat}
              username={account.username}
            />
          </HoverAccountWrapper>
        </Link>
      </div>

      <Stack space={4} className='p-3 pt-10'>
        <Account
          account={account}
          withAvatar={false}
          withRelationship={false}
        />

        {!!account.note && (
          <Text
            truncate
            align='left'
            className='line-clamp-2 inline text-ellipsis [&_br]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate [&_p]:hidden'
          >
            <ParsedContent html={account.note} emojis={account.emojis} speakAsCat={account.speak_as_cat} />
          </Text>
        )}
      </Stack>

      <div className='grid grid-cols-3 gap-1 py-4'>
        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {shortNumberFormat(account.statuses_count)}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.posts' defaultMessage='Posts' />
          </Text>
        </Stack>

        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {shortNumberFormat(account.followers_count)}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.followers' defaultMessage='Followers' />
          </Text>
        </Stack>

        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {account.last_status_at ? (
              <RelativeTimestamp theme='inherit' timestamp={account.last_status_at} />
            ) : (
              <FormattedMessage id='account.never_active' defaultMessage='Never' />
            )}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.last_status' defaultMessage='Last active' />
          </Text>
        </Stack>
      </div>
    </div>
  );
};

const DirectoryPage = () => {
  const intl = useIntl();
  const { order, local } = directoryRoute.useSearch();
  const navigate = useNavigate({ from: directoryRoute.fullPath });
  const instance = useInstance();
  const features = useFeatures();

  const { data: accountIds = [], isLoading, hasNextPage, fetchNextPage } = useDirectory(order, local);

  const handleChangeOrder: React.ChangeEventHandler<HTMLInputElement> = e => {
    navigate({ search: ({ local }) => ({ local, order: e.target.value as 'active' | 'new' }) });
  };

  const handleChangeLocal: React.ChangeEventHandler<HTMLInputElement> = e => {
    navigate({ search: ({ order }) => ({ local: e.target.checked, order }) });
  };

  const handleLoadMore = () => {
    fetchNextPage({ cancelRefetch: false });
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Stack space={4}>
        <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
          <Stack space={2}>
            <CardTitle title={<FormattedMessage id='directory.display_filter' defaultMessage='Display filter' />} />

            <RadioGroup onChange={handleChangeOrder}>
              <RadioItem
                label={intl.formatMessage(messages.recentlyActive)}
                checked={order === 'active'}
                value='active'
              />
              <RadioItem
                label={intl.formatMessage(messages.newArrivals)}
                checked={order === 'new'}
                value='new'
              />
            </RadioGroup>
          </Stack>

          {features.federating && (
            <Stack space={2}>
              <CardTitle title={<FormattedMessage id='directory.fediverse_filter' defaultMessage='Fediverse filter' />} />

              <RadioGroup onChange={handleChangeLocal}>
                <RadioItem
                  label={intl.formatMessage(messages.local, { domain: instance.title })}
                  checked={local}
                  value='1'
                />
                <RadioItem
                  label={intl.formatMessage(messages.federated)}
                  checked={!local}
                  value='0'
                />
              </RadioGroup>
            </Stack>
          )}
        </div>

        <div
          className={
            clsx({
              'grid grid-cols-1 sm:grid-cols-2 gap-2.5': true,
              'opacity-30': isLoading,
            })
          }
        >
          {accountIds.map((accountId) => (
            <AccountCard id={accountId} key={accountId} />),
          )}
        </div>

        {hasNextPage && <LoadMore onClick={handleLoadMore} disabled={isLoading} />}
      </Stack>
    </Column>
  );
};

export { DirectoryPage as default };
