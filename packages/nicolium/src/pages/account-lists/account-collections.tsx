import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { CollectionCard } from '@/components/collections/collection-card';
import { CollectionMenu } from '@/components/collections/collection-menu';
import DropdownMenu from '@/components/dropdown-menu';
import MissingIndicator from '@/components/missing-indicator';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import Tabs from '@/components/ui/tabs';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useCredentialAccount } from '@/queries/accounts/use-account-credentials';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import {
  useAccountCollections,
  useCollectionsFeaturingAccount,
} from '@/queries/accounts/use-collections';
import { profileCollectionsRoute } from '@/router';
import { useModalsActions } from '@/stores/modals';

import type { Collection } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.collections', defaultMessage: 'Collections' },
  createCollection: { id: 'collections.new.create', defaultMessage: 'New collection' },
  createdByYou: { id: 'collections.created_by_you', defaultMessage: 'Created by you' },
  featuringYou: { id: 'collections.featuring_you', defaultMessage: 'Featuring you' },
});

interface ICollectionsList {
  collections?: Array<Collection>;
  isLoading: boolean;
  withAuthorHandle: boolean;
  emptyMessage: React.ReactNode;
}

const CollectionsList: React.FC<ICollectionsList> = ({
  collections,
  isLoading,
  withAuthorHandle,
  emptyMessage,
}) => {
  if (isLoading || !collections) {
    return <Spinner />;
  }

  if (!collections.length) {
    return <div className='lists__empty'>{emptyMessage}</div>;
  }

  return (
    <div className='collections-list'>
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          withAuthorHandle={withAuthorHandle}
          withTimestamp={!withAuthorHandle}
          sideContent={<CollectionMenu collection={collection} context='list' />}
        />
      ))}
    </div>
  );
};

const AccountCollectionsPage: React.FC = () => {
  const intl = useIntl();
  const { username } = profileCollectionsRoute.useParams();

  const { me } = useLoggedIn();
  const { openModal } = useModalsActions();

  const { data: account, isLoading: isLoadingAccount } = useAccountLookup(username);
  const { data: credentialAccount } = useCredentialAccount();

  const isOwnAccount = !!account && account.id === me;

  const [tab, setTab] = useState<'created' | 'featuring'>('created');

  const createdQuery = useAccountCollections(account?.id);
  const featuringQuery = useCollectionsFeaturingAccount(isOwnAccount ? account?.id : undefined);

  if (isLoadingAccount) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  if (!account) {
    return (
      <Column>
        <MissingIndicator />
      </Column>
    );
  }

  const collectionLimit = credentialAccount?.role?.collection_limit;
  const canCreateMore =
    isOwnAccount &&
    (typeof collectionLimit !== 'number' || (createdQuery.data?.length ?? 0) < collectionLimit);

  const items = [
    {
      text: intl.formatMessage(messages.createCollection),
      action: () => {
        openModal('COLLECTION_EDITOR', {});
      },
      icon: iconPlus,
    },
  ];

  const createdEmptyMessage = isOwnAccount ? (
    <FormattedMessage
      id='empty_column.collections.self'
      defaultMessage='Showcase your favorite accounts! Collections are curated lists of accounts to help others discover more of the Fediverse.'
    />
  ) : (
    <FormattedMessage
      id='empty_column.collections'
      defaultMessage='@{acct} has not created any collections yet.'
      values={{ acct: account.acct }}
    />
  );

  const featuringEmptyMessage = (
    <FormattedMessage
      id='empty_column.collections.featured_in'
      defaultMessage='You have not been added to any collections yet.'
    />
  );

  return (
    <Column
      label={intl.formatMessage(messages.heading)}
      transparent
      action={
        canCreateMore ? (
          <DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />
        ) : undefined
      }
    >
      <div className='lists'>
        {isOwnAccount && (
          <Tabs
            items={[
              {
                name: 'created',
                text: intl.formatMessage(messages.createdByYou),
                action: () => setTab('created'),
              },
              {
                name: 'featuring',
                text: intl.formatMessage(messages.featuringYou),
                action: () => setTab('featuring'),
              },
            ]}
            activeItem={tab}
          />
        )}

        {isOwnAccount && !canCreateMore && tab === 'created' && (
          <div className='lists__empty'>
            <FormattedMessage
              id='collections.maximum_collection_count_reached'
              defaultMessage='You have created the maximum number of collections. Your server allows creation of up to {count, plural, one {# collection} other {# collections}}.'
              values={{ count: collectionLimit }}
            />
          </div>
        )}

        {tab === 'created' ? (
          <CollectionsList
            collections={createdQuery.data}
            isLoading={createdQuery.isLoading}
            withAuthorHandle={false}
            emptyMessage={createdEmptyMessage}
          />
        ) : (
          <CollectionsList
            collections={featuringQuery.data}
            isLoading={featuringQuery.isLoading}
            withAuthorHandle
            emptyMessage={featuringEmptyMessage}
          />
        )}
      </div>
    </Column>
  );
};

export { AccountCollectionsPage as default };
