import iconWarningFill from '@phosphor-icons/core/fill/warning-fill.svg';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import RelativeTimestamp from '@/components/relative-timestamp';
import Avatar from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import Emojify from '@/features/emoji/emojify';
import { useAccount } from '@/queries/accounts/use-account';

import type { Collection } from 'pl-api';

const GridAvatar: React.FC<{ accountId?: string | null }> = ({ accountId }) => {
  const { data: account } = useAccount(accountId ?? undefined);

  if (!account) {
    return <div className='collection-card__avatar' />;
  }

  return <Avatar src={account.avatar} size={25} className='collection-card__avatar' />;
};

interface IAvatarGrid {
  accountIds: Array<string | null | undefined>;
  sensitive?: boolean;
}

const AvatarGrid: React.FC<IAvatarGrid> = ({ accountIds, sensitive }) => (
  <div
    className={clsx('collection-card__avatar-grid', {
      'collection-card__avatar-grid--sensitive': sensitive,
    })}
  >
    {([0, 1, 2, 3] as const).map((slot) => (
      <GridAvatar key={slot} accountId={accountIds[slot]} />
    ))}
    {sensitive && (
      <Icon src={iconWarningFill} className='collection-card__sensitive-badge' aria-hidden />
    )}
  </div>
);

interface ICollectionCard {
  collection: Collection;
  withAuthorHandle?: boolean;
  withTimestamp?: boolean;
  sideContent?: React.ReactNode;
}

const CollectionCard: React.FC<ICollectionCard> = ({
  collection,
  withAuthorHandle = true,
  withTimestamp,
  sideContent,
}) => {
  const { data: authorAccount } = useAccount(withAuthorHandle ? collection.account_id : undefined);

  return (
    <div className='collection-card'>
      <AvatarGrid
        accountIds={collection.items.map((item) => item.account_id)}
        sensitive={collection.sensitive}
      />

      <div className='collection-card__main'>
        <Link
          to='/collections/$collectionId'
          params={{ collectionId: collection.id }}
          className='collection-card__name'
        >
          {collection.name}
        </Link>

        <ul className='collection-card__info'>
          {collection.sensitive && (
            <li className='sr-only'>
              <FormattedMessage id='collections.sensitive' defaultMessage='Sensitive' />
            </li>
          )}
          {withAuthorHandle && authorAccount && (
            <li>
              <FormattedMessage
                id='collections.by_account'
                defaultMessage='Created by {account}'
                values={{
                  account: (
                    <Emojify text={authorAccount.display_name} emojis={authorAccount.emojis} />
                  ),
                }}
              />
            </li>
          )}
          <li>
            <FormattedMessage
              id='collections.account_count'
              defaultMessage='{count, plural, one {# account} other {# accounts}}'
              values={{ count: collection.item_count }}
            />
          </li>
          {withTimestamp && (
            <li>
              <FormattedMessage
                id='collections.last_updated_at'
                defaultMessage='Last updated: {date}'
                values={{ date: <RelativeTimestamp timestamp={collection.updated_at} /> }}
              />
            </li>
          )}
        </ul>
      </div>

      {sideContent && <div className='collection-card__side'>{sideContent}</div>}
    </div>
  );
};

export { CollectionCard, AvatarGrid };
