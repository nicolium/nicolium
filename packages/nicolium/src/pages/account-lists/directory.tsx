import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import { AccountLink } from '@/components/accounts/account-link';
import ActionButton from '@/components/accounts/action-button';
import HoverAccountWrapper from '@/components/accounts/hover-account-wrapper';
import Badge from '@/components/badge';
import LoadMore from '@/components/load-more';
import RelativeTimestamp from '@/components/relative-timestamp';
import { ParsedContent } from '@/components/statuses/parsed-content';
import StillImage from '@/components/still-image';
import Avatar from '@/components/ui/avatar';
import { CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import { RadioGroup, RadioItem } from '@/components/ui/radio';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { useFeatures } from '@/hooks/use-features';
import { useAccount } from '@/queries/accounts/use-account';
import { useDirectory } from '@/queries/accounts/use-directory';
import { directoryRoute } from '@/router';
import { useInstance } from '@/stores/instance';
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
  const me = useCurrentAccount();
  const { data: account } = useAccount(id);

  if (!account) return null;

  const followedBy = me !== account.id && account.relationship?.followed_by;

  return (
    <div className='⁂-directory-card'>
      <div className='⁂-directory-card__header'>
        {followedBy && (
          <div className='⁂-directory-card__badge'>
            <Badge
              slug='opaque'
              title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
            />
          </div>
        )}

        <div className='⁂-directory-card__action'>
          <ActionButton account={account} small />
        </div>

        {account.header ? (
          <StillImage
            src={account.header}
            staticSrc={account.header_static}
            alt={account.header_description}
            className='⁂-directory-card__header__image'
          />
        ) : (
          <div className='⁂-directory-card__header__image--empty' />
        )}

        <AccountLink account={account}>
          <HoverAccountWrapper key={account.id} accountId={account.id} element='span'>
            <Avatar
              src={account.avatar}
              alt={account.avatar_description}
              className='⁂-directory-card__avatar'
              size={64}
              isCat={account.is_cat}
              username={account.username}
            />
          </HoverAccountWrapper>
        </AccountLink>
      </div>

      <div className='⁂-directory-card__account'>
        <Account account={account} withAvatar={false} withRelationship={false} />

        {!!account.note && (
          <p className='⁂-directory-card__bio'>
            <ParsedContent
              html={account.note}
              emojis={account.emojis}
              speakAsCat={account.speak_as_cat}
            />
          </p>
        )}
      </div>

      <div className='⁂-directory-card__details'>
        <div>
          <p>{shortNumberFormat(account.statuses_count)}</p>

          <p>
            <FormattedMessage id='account.posts' defaultMessage='Posts' />
          </p>
        </div>

        <div>
          <p>{shortNumberFormat(account.followers_count)}</p>

          <p>
            <FormattedMessage id='account.followers' defaultMessage='Followers' />
          </p>
        </div>

        <div>
          <p>
            {account.last_status_at ? (
              <RelativeTimestamp theme='inherit' timestamp={account.last_status_at} />
            ) : (
              <FormattedMessage id='account.never_active' defaultMessage='Never' />
            )}
          </p>

          <p>
            <FormattedMessage id='account.last_status' defaultMessage='Last active' />
          </p>
        </div>
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

  const {
    data: accountIds = [],
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useDirectory(order, local);

  const handleChangeOrder: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    navigate({ search: ({ local }) => ({ local, order: e.target.value as 'active' | 'new' }) });
  };

  const handleChangeLocal: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    navigate({ search: ({ order }) => ({ local: e.target.value === 'local', order }) });
  };

  const handleLoadMore = () => {
    fetchNextPage({ cancelRefetch: false });
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <div className='⁂-directory'>
        <div className='⁂-directory__filters'>
          <div>
            <CardTitle
              title={<FormattedMessage id='directory.display_filter' defaultMessage='Ordered by' />}
            />

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
          </div>

          {features.federating && (
            <div>
              <CardTitle
                title={
                  <FormattedMessage
                    id='directory.fediverse_filter'
                    defaultMessage='Fediverse filter'
                  />
                }
              />

              <RadioGroup onChange={handleChangeLocal}>
                <RadioItem
                  label={intl.formatMessage(messages.local, { domain: instance.title })}
                  checked={local}
                  value='local'
                />
                <RadioItem
                  label={intl.formatMessage(messages.federated)}
                  checked={!local}
                  value='federated'
                />
              </RadioGroup>
            </div>
          )}
        </div>

        <div
          className={clsx({
            '⁂-directory__cards': true,
            '⁂-directory__cards--loading': isLoading,
          })}
        >
          {accountIds.map((accountId) => (
            <AccountCard id={accountId} key={accountId} />
          ))}
        </div>

        {hasNextPage && <LoadMore onClick={handleLoadMore} disabled={isLoading} />}
      </div>
    </Column>
  );
};

export { DirectoryPage as default };
