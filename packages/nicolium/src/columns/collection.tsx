import iconExport from '@phosphor-icons/core/regular/export.svg';
import iconHash from '@phosphor-icons/core/regular/hash.svg';
import iconUser from '@phosphor-icons/core/regular/user.svg';
import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import { AccountLink } from '@/components/accounts/account-link';
import VerificationBadge from '@/components/accounts/verification-badge';
import { CollectionMenu } from '@/components/collections/collection-menu';
import { useRevokeCollection } from '@/components/collections/use-revoke-collection';
import HashtagLink from '@/components/hashtag-link';
import MissingIndicator from '@/components/missing-indicator';
import PlaceholderAccount from '@/components/placeholders/placeholder-account';
import ScrollableList from '@/components/scrollable-list';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import Spinner from '@/components/ui/spinner';
import Emojify from '@/emoji/emojify';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useAccount } from '@/queries/accounts/use-account';
import { useAccounts } from '@/queries/accounts/use-accounts';
import { useCollection } from '@/queries/accounts/use-collections';

import type { Account, Collection } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.collection', defaultMessage: 'Collection' },
  share: { id: 'collections.share', defaultMessage: 'Share' },
  sortAlphabetical: { id: 'collections.sort.alphabetical', defaultMessage: 'Alphabetical' },
  sortLastActive: { id: 'collections.sort.last_active', defaultMessage: 'Last active' },
  sortMostFollowers: { id: 'collections.sort.most_followers', defaultMessage: 'Most followers' },
  sortDateAdded: { id: 'collections.sort.date_added', defaultMessage: 'Date added' },
});

type SortBy = 'date_added' | 'alphabetical' | 'last_active' | 'most_followers';

interface IAuthorNote {
  /** Collection author account ID. */
  accountId: string;
}

/** Information about the collection author. */
const AuthorNote: React.FC<IAuthorNote> = ({ accountId }) => {
  const { data: account } = useAccount(accountId);

  if (!account) {
    return null;
  }

  return (
    <p className='collection__author'>
      <FormattedMessage
        id='collections.by_account'
        defaultMessage='Created by {account}'
        values={{
          account: (
            <AccountLink className='mention' account={account}>
              <span>
                <Emojify text={account.display_name} emojis={account.emojis} />
              </span>
              {account.verified && <VerificationBadge />}
            </AccountLink>
          ),
        }}
      />
    </p>
  );
};

interface ICollectionAccounts {
  /** Collection entity. */
  collection: Collection;
  /** Whether displayed by the collection author. */
  isOwnCollection: boolean;
}

/** List of accounts in a collection. */
const CollectionAccounts: React.FC<ICollectionAccounts> = ({ collection, isOwnCollection }) => {
  const intl = useIntl();
  const [sortBy, setSortBy] = useState<SortBy>('date_added');

  const items = useMemo(
    () => collection.items.filter((item) => !!item.account_id),
    [collection.items],
  );
  const { data: accounts } = useAccounts(items.map((item) => item.account_id!));

  const sortedItems = useMemo(() => {
    if (sortBy === 'date_added') {
      return items;
    }

    const accountsById = accounts.reduce<Record<string, Account>>((acc, account) => {
      acc[account.id] = account;
      return acc;
    }, {});

    return items.toSorted((a, b) => {
      const accountA = accountsById[a.account_id!];
      const accountB = accountsById[b.account_id!];

      switch (sortBy) {
        case 'alphabetical':
          return (accountA?.display_name ?? '').localeCompare(accountB?.display_name ?? '');
        case 'last_active':
          return (
            new Date(accountB?.last_status_at ?? 0).getTime() -
            new Date(accountA?.last_status_at ?? 0).getTime()
          );
        case 'most_followers':
          return (accountB?.followers_count ?? 0) - (accountA?.followers_count ?? 0);
        default:
          return 0;
      }
    });
  }, [items, accounts, sortBy]);

  return (
    <div className='collection__accounts'>
      <div className='collection__accounts-header'>
        <h3>
          <FormattedMessage
            id='collections.account_count'
            defaultMessage='{count, plural, one {# account} other {# accounts}}'
            values={{ count: collection.item_count }}
          />
        </h3>
        <div className='collection__sort'>
          <span>
            <FormattedMessage id='collections.sort_by' defaultMessage='Sort by:' />
          </span>
          <SelectDropdown
            items={{
              date_added: intl.formatMessage(messages.sortDateAdded),
              alphabetical: intl.formatMessage(messages.sortAlphabetical),
              last_active: intl.formatMessage(messages.sortLastActive),
              most_followers: intl.formatMessage(messages.sortMostFollowers),
            }}
            defaultValue={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          />
        </div>
      </div>

      {sortedItems.length ? (
        <ScrollableList
          placeholderComponent={PlaceholderAccount}
          placeholderCount={collection.item_count}
          itemClassName='account-list__item'
        >
          {sortedItems.map((item) => (
            <div key={item.id} className='collection__account'>
              <AccountContainer id={item.account_id!} withRelationship />
              {isOwnCollection && item.state === 'pending' && (
                <span className='collection__pending-badge'>
                  <FormattedMessage id='collections.account.pending' defaultMessage='Pending' />
                </span>
              )}
            </div>
          ))}
        </ScrollableList>
      ) : (
        <div className='empty-column-indicator'>
          <FormattedMessage
            id='empty_column.collection'
            defaultMessage='This collection is empty'
          />
        </div>
      )}
    </div>
  );
};

interface ICollectionColumn {
  /** The ID of the collection. */
  collectionId: string;
}

const CollectionColumn: React.FC<ICollectionColumn> = ({ collectionId }) => {
  const intl = useIntl();

  const { me } = useLoggedIn();

  const { data: collection, isLoading } = useCollection(collectionId);
  const confirmRevoke = useRevokeCollection(collection);

  const isOwnCollection = !!collection && collection.account_id === me;
  const [revealed, setRevealed] = useState(false);

  const handleShare = () => {
    if ('share' in navigator && collection?.url) {
      navigator.share({
        text: collection.name,
        url: collection.url,
      });
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!collection) {
    return <MissingIndicator />;
  }

  const contentVisible = revealed || isOwnCollection || !collection.sensitive;
  const hasPendingItems =
    isOwnCollection && collection.items.some((item) => item.state === 'pending');
  const ownItem = !isOwnCollection
    ? collection.items.find((item) => item.account_id === me)
    : undefined;

  return (
    <div className='collection'>
      <div className='collection__header'>
        <div className='collection__title__container'>
          <h2 className='collection__title'>{collection.name}</h2>
          <div className='collection__actions'>
            {'share' in navigator && (
              <IconButton
                src={iconExport}
                title={intl.formatMessage(messages.share)}
                onClick={handleShare}
                theme='outlined'
              />
            )}
            <CollectionMenu collection={collection} context='collection' />
          </div>
        </div>

        <div className='event-header__details'>
          <div className='event-header__detail'>
            <Icon src={iconUser} />
            <span>
              <AuthorNote accountId={collection.account_id} />
            </span>
          </div>
          <div className='event-header__detail'>
            <Icon src={iconHash} />
            {collection.tag && <HashtagLink hashtag={collection.tag.name} />}
          </div>
        </div>
      </div>

      {contentVisible && collection.description && (
        <p className='collection__description'>{collection.description}</p>
      )}

      {hasPendingItems && (
        <div className='collection__callout'>
          <p className='collection__callout-title'>
            <FormattedMessage
              id='collections.pending_accounts.title'
              defaultMessage='Why am I seeing pending accounts?'
            />
          </p>
          <p>
            <FormattedMessage
              id='collections.pending_accounts.message'
              defaultMessage='Accounts may appear as pending when we’re awaiting a response from the user or their server. Only you can see pending accounts.'
            />
          </p>
        </div>
      )}

      {ownItem && confirmRevoke && (
        <div className='collection__callout'>
          <p className='collection__callout-title'>
            <FormattedMessage
              id='collections.featured.title'
              defaultMessage='You’re featured in this collection'
            />
          </p>
          <button type='button' onClick={confirmRevoke}>
            <FormattedMessage id='collections.revoke_inclusion' defaultMessage='Remove me' />
          </button>
        </div>
      )}

      {contentVisible ? (
        <CollectionAccounts collection={collection} isOwnCollection={isOwnCollection} />
      ) : (
        <div className='collection__callout collection__callout--warning'>
          <p className='collection__callout-title'>
            <FormattedMessage id='collections.sensitive.title' defaultMessage='Sensitive content' />
          </p>
          <p>
            <FormattedMessage
              id='collections.sensitive.message'
              defaultMessage='The description and accounts may not be suitable for all viewers.'
            />
          </p>
          <button type='button' onClick={() => setRevealed(true)}>
            <FormattedMessage id='collections.sensitive.show' defaultMessage='Show' />
          </button>
        </div>
      )}
    </div>
  );
};

export { CollectionColumn as default };
