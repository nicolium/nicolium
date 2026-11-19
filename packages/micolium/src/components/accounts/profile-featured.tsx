import { Divider, List, Text } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { HashIcon } from 'phosphor-react-native/src/icons/Hash';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useAccountCollections,
  useCollectionsFeaturingAccount,
} from '@/queries/accounts/use-collections';
import { useEndorsedAccounts } from '@/queries/accounts/use-endorsed-accounts';
import { useFeaturedTags } from '@/queries/accounts/use-featured-tags';

import { CollectionItem } from '../collections/collection-item';
import { CreateCollectionDialog } from '../collections/create-collection-dialog';
import { EmptyMessage } from '../ui/empty-message';
import { GlassButton } from '../ui/glass-button';
import { iconHelper } from '../ui/icon';

import { Account } from './account';

import type { Account as AccountEntity, Collection, FeaturedTag } from 'pl-api';

const messages = defineMessages({
  createdBy: { id: 'collections.created_by', defaultMessage: 'Created by @{acct}' },
  featuring: { id: 'collections.featuring', defaultMessage: 'Featuring @{acct}' },
  createdByYou: { id: 'collections.created_by_you', defaultMessage: 'Created by you' },
  featuringYou: { id: 'collections.featuring_you', defaultMessage: 'Featuring you' },
});

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

interface IProfileFeatured {
  tab: 'hashtags' | 'accounts' | 'collections';
  account: AccountEntity;
  header: React.JSX.Element;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  ownAccount?: boolean;
}

const ProfileFeatured: React.FC<IProfileFeatured> = ({
  tab,
  account,
  header,
  onScroll,
  ownAccount,
}) => {
  const intl = useIntl();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const [createDialog, setCreateDialog] = React.useState(false);

  const featuredTagsQuery = useFeaturedTags(account.id);
  const endorsedAccountsQuery = useEndorsedAccounts(account.id);
  const collectionsQuery = useAccountCollections(account.id);
  const featuringCollectionsQuery = useCollectionsFeaturingAccount(account.id);

  const listProps = {
    ItemSeparatorComponent: Divider,
    ListHeaderComponent:
      tab === 'collections' && ownAccount ? (
        <>
          {header}

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 12 }}>
            <GlassButton
              mode='contained-tonal'
              onPress={() => setCreateDialog(true)}
              icon={iconHelper(PlusIcon)}
            >
              <FormattedMessage id='collections.new.create' defaultMessage='New collection' />
            </GlassButton>
          </View>

          {createDialog && (
            <CreateCollectionDialog visible onDismiss={() => setCreateDialog(false)} />
          )}
        </>
      ) : (
        header
      ),
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
          renderItem={({ item }) => <FeaturedTagItem tag={item} accountId={account.id} />}
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
    case 'collections': {
      const collections: Array<string | Collection> = [];

      if (collectionsQuery.data?.length) {
        collections.push(
          intl.formatMessage(ownAccount ? messages.createdByYou : messages.createdBy, {
            acct: account.acct,
          }),
          ...collectionsQuery.data,
        );
      }

      if (featuringCollectionsQuery.data?.length) {
        collections.push(
          intl.formatMessage(ownAccount ? messages.featuringYou : messages.featuring, {
            acct: account.acct,
          }),
          ...featuringCollectionsQuery.data,
        );
      }

      return (
        <FlashList
          data={collections}
          // keyExtractor={(collection) => typeof collection === 'string' ? collection : collection.id}
          renderItem={({ item }) =>
            typeof item === 'string' ? (
              <Text variant='labelLarge' style={{ paddingHorizontal: 12 }}>
                {item}
              </Text>
            ) : (
              <CollectionItem collection={item} />
            )
          }
          {...listProps}
          ItemSeparatorComponent={({ leadingItem, trailingItem }) =>
            typeof leadingItem === 'string' || typeof trailingItem === 'string' ? undefined : (
              <Divider />
            )
          }
        />
      );
    }
  }
};

export { ProfileFeatured };
