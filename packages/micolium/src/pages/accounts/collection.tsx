import { Divider, Text, useTheme } from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

import { Account } from '@/components/accounts/account';
import { CollectionActionsDropdown } from '@/components/collections/collection-actions-dropdown';
import { Emojify } from '@/components/ui/emojify';
import { EmptyMessage } from '@/components/ui/empty-message';
import { useAccount } from '@/queries/accounts/use-account';
import { useCollection } from '@/queries/accounts/use-collections';

import type { AccountStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const AccountCollectionScreen = ({
  navigation,
  route: {
    params: { id },
  },
}: NativeStackScreenProps<AccountStackParams, 'collection'>) => {
  const { colors } = useTheme();

  const { data: collection, isPending } = useCollection(id);
  const { data: collectionAccount } = useAccount(collection?.account_id);

  const accountIds = collection?.items
    .filter((item) => item.state === 'accepted' && item.account_id)
    .map((item) => item.account_id!);

  return (
    <FlashList
      data={accountIds}
      keyExtractor={(accountId) => accountId}
      renderItem={({ item }) => (
        <Account id={item} style={{ paddingVertical: 8, padding: 12 }} withLink withFollowButton />
      )}
      ItemSeparatorComponent={Divider}
      ListHeaderComponent={
        collection && (
          <View style={{ gap: 4, padding: 16 }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                alignItems: 'center',
                gap: 4,
                justifyContent: 'space-between',
              }}
            >
              <View>
                <Text variant='bodyLarge'>{collection.name}</Text>
                {collectionAccount && (
                  <Text variant='labelLarge'>
                    <FormattedMessage
                      id='collections.by_account'
                      defaultMessage='Created by {account}'
                      values={{
                        account: (
                          <Text
                            variant='labelLarge'
                            style={{ color: colors.primary }}
                            onPress={() =>
                              navigation.navigate('accounts', {
                                screen: 'view',
                                params: { id: collection.account_id },
                              })
                            }
                          >
                            <Emojify
                              text={collectionAccount.display_name}
                              emojis={collectionAccount.emojis}
                            />
                          </Text>
                        ),
                      }}
                    />
                  </Text>
                )}
              </View>
              <CollectionActionsDropdown collection={collection} />
            </View>
            {collection?.description && <Text variant='bodyMedium'>{collection.description}</Text>}
          </View>
        )
      }
      ListEmptyComponent={
        !isPending ? (
          <EmptyMessage
            emptyMessageText={
              <FormattedMessage
                id='empty_column.collection'
                defaultMessage='This collection is empty'
              />
            }
          />
        ) : null
      }
    />
  );
};

export { AccountCollectionScreen };
