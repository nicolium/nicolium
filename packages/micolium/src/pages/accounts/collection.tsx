import { Divider, IconButton, Text, TouchableRipple, useTheme } from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import * as Clipboard from 'expo-clipboard';
import { shareAsync } from 'expo-sharing';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Platform, Pressable, View } from 'react-native';

import { Account } from '@/components/accounts/account';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Emojify } from '@/components/ui/emojify';
import { EmptyMessage } from '@/components/ui/empty-message';
import { iconHelper } from '@/components/ui/icon';
import { useAccount } from '@/queries/accounts/use-account';
import { useCollection } from '@/queries/accounts/use-collections';
import { openUrl } from '@/utils/url';

import type { DropdownMenuItem } from '@/components/ui/dropdown-menu-types';
import type { AccountStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Collection } from 'pl-api';

const messages = {
  copy: { id: 'account.copy.short', defaultMessage: 'Copy link' },
  openInBrowser: { id: 'account.open_in_browser.short', defaultMessage: 'Open in browser' },
  share: { id: 'collections.share', defaultMessage: 'Share' },
  menuTitle: { id: 'dropdown_menu.title', defaultMessage: 'Menu' },
};

const useMenuItems = (collection: Collection) => {
  const intl = useIntl();

  const items: Array<DropdownMenuItem> = [];

  if (collection.url) {
    const url = collection.url;

    const handleCopy = () => Clipboard.setStringAsync(url);
    const handleOpenInBrowser = () => openUrl(url);
    const handleShare = () => shareAsync(url);

    const shareItems: Array<DropdownMenuItem> = [
      {
        key: 'copy',
        type: 'button',
        label: intl.formatMessage(messages.copy),
        appleIcon: 'link',
        androidIcon: 'ph_link_simple_horizontal',
        onPress: handleCopy,
      },
      {
        key: 'open-in-browser',
        type: 'button',
        label: intl.formatMessage(messages.openInBrowser),
        appleIcon: 'safari',
        androidIcon: 'ph_arrow_square_out',
        onPress: handleOpenInBrowser,
      },
      {
        key: 'share',
        type: 'button',
        label: intl.formatMessage(messages.share),
        appleIcon: 'square.and.arrow.up',
        androidIcon: 'ph_export',
        onPress: handleShare,
      },
    ];

    items.push({ key: 'share', type: 'section', children: shareItems, controlGroup: true });
  }

  return items;
};

const AccountCollectionScreen = ({
  navigation,
  route: {
    params: { id },
  },
}: NativeStackScreenProps<AccountStackParams, 'collection'>) => {
  const { colors } = useTheme();
  const intl = useIntl();

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
                <Text variant='bodyMedium'>{collection.name}</Text>
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
              <DropdownMenu
                trigger={
                  <IconButton
                    icon={iconHelper(Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon)}
                    style={{ height: 32, width: 32 }}
                    onPress={() => {}}
                    accessibilityLabel={intl.formatMessage(messages.menuTitle)}
                  />
                }
                useItems={useMenuItems}
                hookArgs={[collection]}
              />
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
