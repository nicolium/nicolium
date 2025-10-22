import clsx from 'clsx';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import Account from 'pl-fe/components/account';
import Badge from 'pl-fe/components/badge';
import HoverAccountWrapper from 'pl-fe/components/hover-account-wrapper';
import LoadMore from 'pl-fe/components/load-more';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import { RadioGroup, RadioItem } from 'pl-fe/components/radio';
import RelativeTimestamp from 'pl-fe/components/relative-timestamp';
import Avatar from 'pl-fe/components/ui/avatar';
import { CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import ActionButton from 'pl-fe/features/ui/components/action-button';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useDirectory } from 'pl-fe/queries/accounts/use-directory';
import { useSettings } from 'pl-fe/stores/settings';
import { shortNumberFormat } from 'pl-fe/utils/numbers';

const messages = defineMessages({
  title: { id: 'column.directory', defaultMessage: 'Browse profiles' },
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
  const { autoPlayGif } = useSettings();

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

        <img
          src={autoPlayGif ? account.header : account.header_static}
          alt={account.header_description}
          className='h-32 w-full rounded-t-lg object-cover'
        />

        <Link to={`/@${account.acct}`} title={account.acct}>
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
  const [params, setParams] = useSearchParams();
  const instance = useInstance();
  const features = useFeatures();

  const order = (params.get('order') || 'active') as 'active' | 'new';
  const local = !!params.get('local');

  const { data: accountIds = [], isLoading, hasNextPage, fetchNextPage } = useDirectory(order, local);

  const handleChangeOrder: React.ChangeEventHandler<HTMLInputElement> = e => {
    setParams({ local: local ? 'true' : '', order: e.target.value });
  };

  const handleChangeLocal: React.ChangeEventHandler<HTMLInputElement> = e => {
    setParams({ local: e.target.value === '1' ? 'true' : '', order });
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
