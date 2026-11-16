import {
  Appbar,
  Avatar,
  Badge,
  Divider,
  Icon,
  Text,
  TouchableRipple,
  useTheme,
} from '@mkljczk/react-native-paper';
import { useScrollToTop } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackHeaderProps,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { PaperclipIcon } from 'phosphor-react-native/src/icons/Paperclip';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RelativeTimestamp from '@/components/relative-timestamp';
import { CornerInset } from '@/components/ui/corner-inset';
import { Emojify } from '@/components/ui/emojify';
import { EmptyMessage } from '@/components/ui/empty-message';
import { LoadMore } from '@/components/ui/load-more';
import { useChats } from '@/queries/chats';
import { useSetting } from '@/stores/settings';

import type { ChatsStackParams } from '@/router/router';
import type { Chat as ChatEntity } from 'pl-api';

const ChatsHeader = (_: NativeStackHeaderProps) => {
  const { colors } = useTheme();

  return (
    <Appbar.Header
      mode='small'
      style={{
        backgroundColor: colors.surfaceContainer,
      }}
    >
      <CornerInset direction='horizontal' edge='left' />
      <Appbar.Content
        title={
          <Text variant='titleLarge'>
            <FormattedMessage id='column.chats' defaultMessage='Chats' />
          </Text>
        }
      />
    </Appbar.Header>
  );
};

interface IChat {
  chat: ChatEntity;
}

const Chat: React.FC<IChat> = ({ chat }) => {
  const { colors } = useTheme();

  return (
    <TouchableRipple onPress={() => {}} style={{ paddingVertical: 8, padding: 12 }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <View style={{ position: 'relative' }}>
          {chat.account.avatar ? (
            <Image
              source={{ uri: chat.account.avatar }}
              accessibilityLabel={chat.account.avatar_description}
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
              }}
              contentFit='contain'
              recyclingKey={`avatar-${chat.account.id}`}
            />
          ) : (
            <Avatar.Text
              size={40}
              label={(chat.account.display_name || chat.account.acct).slice(0, 2)}
            />
          )}
          {chat.unread > 0 && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                transform: 'translate(25%, 25%)',
              }}
            >
              <Badge>{chat.unread}</Badge>
            </View>
          )}
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
          <View style={{ gap: 4, alignItems: 'center', flexDirection: 'row', maxWidth: '100%' }}>
            <Text variant='titleMedium' numberOfLines={1}>
              {chat.account.emojis ? (
                <Emojify text={chat.account.display_name} emojis={chat.account.emojis} />
              ) : (
                chat.account.display_name
              )}
              <Text variant='bodySmall' style={{ flex: 1, color: colors.outline }}>
                {' · '}
                <RelativeTimestamp timestamp={chat.updated_at} />
              </Text>
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              gap: 4,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            {chat.last_message ? (
              <Text
                variant='bodyMedium'
                numberOfLines={1}
                style={{
                  color: colors.outline,
                  fontStyle: chat.last_message.attachment ? 'italic' : 'normal',
                }}
              >
                {chat.last_message.attachment ? (
                  <FormattedMessage id='chat.attachment' defaultMessage='Attachment' />
                ) : (
                  chat.last_message.content
                )}
              </Text>
            ) : (
              <Text
                variant='bodyMedium'
                numberOfLines={1}
                style={{ color: colors.outline, fontStyle: 'italic' }}
              >
                <FormattedMessage id='chat.empty' defaultMessage='No messages yet.' />
              </Text>
            )}
            {chat.last_message?.attachment && <Icon source={PaperclipIcon} size={16} />}
          </View>
        </View>
      </View>
    </TouchableRipple>
  );
};

const ChatsScreen = (_: NativeStackScreenProps<ChatsStackParams, 'all'>) => {
  const { chatsQuery } = useChats();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const ref = React.useRef<FlashListRef<ChatEntity>>(null);
  useScrollToTop(ref);

  const autoloadMore = useSetting('timelines.autoloadMore');

  return (
    <FlashList
      ref={ref}
      data={chatsQuery.data}
      renderItem={({ item }) => <Chat chat={item} />}
      ItemSeparatorComponent={Divider}
      onEndReached={
        autoloadMore && chatsQuery.hasNextPage && !chatsQuery.isFetching
          ? chatsQuery.fetchNextPage
          : undefined
      }
      onEndReachedThreshold={0.1}
      onRefresh={chatsQuery.refetch}
      refreshing={chatsQuery.isRefetching}
      ListEmptyComponent={
        !chatsQuery.isPending ? (
          <EmptyMessage
            emptyMessageHeading={
              <FormattedMessage id='chats.main.blankslate.title' defaultMessage='No messages yet' />
            }
            emptyMessageText={
              <FormattedMessage
                id='chats.main.blankslate.subtitle'
                defaultMessage='Search for someone to chat with'
              />
            }
          />
        ) : null
      }
      ListFooterComponent={<LoadMore query={chatsQuery} />}
      contentContainerStyle={{
        paddingBottom: bottomInset,
      }}
    />
  );
};

const ChatsStack = createNativeStackNavigator<ChatsStackParams>();

const ChatsStackScreen = () => {
  return (
    <ChatsStack.Navigator>
      <ChatsStack.Screen name='all' component={ChatsScreen} options={{ header: ChatsHeader }} />
    </ChatsStack.Navigator>
  );
};

export { ChatsStackScreen };
