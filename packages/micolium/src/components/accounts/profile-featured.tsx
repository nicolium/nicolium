import { Divider, List } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { HashIcon } from 'phosphor-react-native/src/icons/Hash';
import { ShapesIcon } from 'phosphor-react-native/src/icons/Shapes';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccountCollections } from '@/queries/accounts/use-collections';
import { useEndorsedAccounts } from '@/queries/accounts/use-endorsed-accounts';
import { useFeaturedTags } from '@/queries/accounts/use-featured-tags';

import { EmptyMessage } from '../ui/empty-message';
import { iconHelper } from '../ui/icon';

import { Account } from './account';

import type { Collection, FeaturedTag } from 'pl-api';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface IFeaturedTagItem {
  tag: FeaturedTag;
  accountId: string;
}

const FeaturedTagItem: React.FC<IFeaturedTagItem> = ({ tag, accountId }) => {
  const navigation = useNavigation();

  return (
    <List.Item
      title={`#${tag.name}`}
      description={
        <FormattedMessage
          id='account.statuses_count'
          defaultMessage='{count, plural, one {# post} other {# posts}}'
          values={{ count: tag.statuses_count }}
        />
      }
      left={(props) => <List.Icon {...props} icon={iconHelper(HashIcon)} />}
      onPress={() => navigation.navigate('hashtags', { tag: tag.name, accountId })}
    />
  );
};

interface ICollectionItem {
  collection: Collection;
}

const CollectionItem: React.FC<ICollectionItem> = ({ collection }) => {
  const navigation = useNavigation();

  return (
    <List.Item
      title={collection.name}
      description={
        <FormattedMessage
          id='collections.account_count'
          defaultMessage='{count, plural, one {# account} other {# accounts}}'
          values={{ count: collection.item_count }}
        />
      }
      left={(props) => <List.Icon {...props} icon={iconHelper(ShapesIcon)} />}
      onPress={() =>
        navigation.navigate('accounts', {
          screen: 'collection',
          params: { id: collection.id },
        })
      }
    />
  );
};

interface IProfileFeatured {
  tab: 'hashtags' | 'accounts' | 'collections';
  accountId: string;
  header: React.JSX.Element;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const ProfileFeatured: React.FC<IProfileFeatured> = ({ tab, accountId, header, onScroll }) => {
  const { bottom: bottomInset } = useSafeAreaInsets();

  const featuredTagsQuery = useFeaturedTags(accountId);
  const endorsedAccountsQuery = useEndorsedAccounts(accountId);
  const collectionsQuery = useAccountCollections(accountId);

  const listProps = {
    ItemSeparatorComponent: Divider,
    ListHeaderComponent: header,
    ListEmptyComponent: (
      <EmptyMessage
        emptyMessageText={
          // shouldn't happen
          <FormattedMessage id='empty_column.account_featured' defaultMessage='Nothing here.' />
        }
      />
    ),
    onScroll,
    contentContainerStyle: { paddingBottom: bottomInset },
  };

  switch (tab) {
    case 'hashtags':
      return (
        <FlashList
          data={featuredTagsQuery.data}
          keyExtractor={(tag) => tag.id}
          renderItem={({ item }) => <FeaturedTagItem tag={item} accountId={accountId} />}
          {...listProps}
        />
      );
    case 'accounts':
      return (
        <FlashList
          data={endorsedAccountsQuery.data}
          keyExtractor={(id) => id}
          renderItem={({ item }) => (
            <Account
              id={item}
              style={{ paddingVertical: 8, padding: 12 }}
              withLink
              withFollowButton
            />
          )}
          {...listProps}
        />
      );
    case 'collections':
      return (
        <FlashList
          data={collectionsQuery.data}
          keyExtractor={(collection) => collection.id}
          renderItem={({ item }) => <CollectionItem collection={item} />}
          {...listProps}
        />
      );
  }
};

export { ProfileFeatured, CollectionItem };
