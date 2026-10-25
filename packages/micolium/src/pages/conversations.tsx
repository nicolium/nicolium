import { Chip, Divider, Text, TouchableRipple, useTheme } from '@mkljczk/react-native-paper';
import { Link, useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { EnvelopeSimpleIcon } from 'phosphor-react-native/src/icons/EnvelopeSimple';
import React from 'react';
import { defineMessages, FormattedList, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Account } from '@/components/accounts/account';
import { ComposeButton } from '@/components/compose-button';
import { Status } from '@/components/statuses/status';
import { EmptyMessage } from '@/components/ui/empty-message';
import { Header } from '@/components/ui/header';
import { iconHelper } from '@/components/ui/icon';
import { LoadMore } from '@/components/ui/load-more';
import { useAccounts } from '@/queries/accounts/use-accounts';
import {
  useConversations,
  useMarkConversationRead,
} from '@/queries/conversations/use-conversations';
import { useSetting } from '@/stores/settings';

import { useShowComposeButton } from './home';

import type { MinifiedConversation } from '@/queries/utils/minify-list';
import type { RootStackParams, ConversationsStackParams } from '@/router/router';

const messages = defineMessages({
  heading: { id: 'column.direct', defaultMessage: 'Conversations' },
  mentionsHeader: { id: 'column.mentions', defaultMessage: 'Mentions' },
});

interface IConversation {
  conversation: MinifiedConversation;
}

const Conversation: React.FC<IConversation> = ({ conversation }) => {
  const navigation = useNavigation('conversations');
  const { colors } = useTheme();

  const { data: accounts } = useAccounts(conversation.account_ids.slice(0, 2));
  const { mutate: markRead } = useMarkConversationRead(conversation.id);

  const handlePress = () => {
    if (conversation.unread) markRead();
    if (conversation.last_status) {
      navigation.navigate('status', {
        screen: 'view',
        params: { id: conversation.last_status },
      });
    }
  };

  const renderedAccounts = accounts.map((account) => (
    <Link
      screen='accounts'
      params={{ screen: 'view', params: { id: account.id } }}
      key={account.id}
    >
      @{account.username}
    </Link>
  ));

  if (conversation.account_ids.length > 2) {
    renderedAccounts.push(
      <Link
        screen='conversations'
        params={{ screen: 'mentions', params: { id: conversation.id } }}
        key='more'
      >
        <FormattedMessage
          id='reply_mentions.more'
          defaultMessage='{count} more'
          values={{ count: conversation.account_ids.length - 2 }}
        />
      </Link>,
    );
  }

  return (
    <TouchableRipple
      onPress={handlePress}
      style={{
        backgroundColor: conversation.unread ? colors.primaryContainer : undefined,
      }}
    >
      <View>
        {accounts.length > 0 && (
          <View style={{ flexDirection: 'row' }}>
            <Chip
              mode='outlined'
              icon={iconHelper(EnvelopeSimpleIcon)}
              compact
              style={{ marginHorizontal: 16, marginTop: 8 }}
            >
              <Text variant='labelLarge'>
                <FormattedMessage
                  id='conversations.with_others'
                  defaultMessage='Conversation with {accounts}'
                  values={{
                    accounts: <FormattedList type='conjunction' value={renderedAccounts} />,
                  }}
                />
              </Text>
            </Chip>
          </View>
        )}
        {conversation.last_status && (
          <Status id={conversation.last_status} style={{ paddingTop: 8 }} />
        )}
      </View>
    </TouchableRipple>
  );
};

const ConversationsScreen = (_: NativeStackScreenProps<ConversationsStackParams, 'index'>) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const autoloadMore = useSetting('timelines.autoloadMore');
  const { showComposeButton, handleScroll } = useShowComposeButton();

  const query = useConversations();

  return (
    <>
      <FlashList
        data={query.conversations}
        keyExtractor={(conversation) => conversation.id}
        renderItem={({ item }) => <Conversation conversation={item} />}
        ItemSeparatorComponent={Divider}
        onEndReached={
          autoloadMore && query.hasNextPage && !query.isFetching ? query.fetchNextPage : undefined
        }
        onEndReachedThreshold={0.1}
        onRefresh={query.refetch}
        refreshing={query.isRefetching}
        ListEmptyComponent={
          !query.isPending ? (
            <EmptyMessage
              emptyMessageIcon={iconHelper(EnvelopeSimpleIcon)}
              emptyMessageText={
                <FormattedMessage
                  id='empty_column.direct'
                  defaultMessage='You don’t have any direct messages yet. When you send or receive one, it will show up here.'
                />
              }
            />
          ) : null
        }
        ListFooterComponent={
          <View style={{ paddingBottom: bottomInset }}>
            <LoadMore query={query} />
          </View>
        }
        onScroll={handleScroll}
      />
      <ComposeButton direct visible={showComposeButton} />
    </>
  );
};

const ConversationMentionsScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<ConversationsStackParams, 'mentions'>) => {
  const conversation = useConversations().conversations.find(
    (conversation) => conversation.id === id,
  );

  return (
    <FlashList
      data={conversation?.account_ids}
      renderItem={({ item }) => (
        <Account id={item} style={{ paddingVertical: 8, padding: 12 }} withLink />
      )}
      ItemSeparatorComponent={Divider}
    />
  );
};

const ConversationsStack = createNativeStackNavigator<ConversationsStackParams>();

const ConversationsStackScreen = (
  _props: NativeStackScreenProps<RootStackParams, 'conversations'>,
) => {
  const intl = useIntl();
  return (
    <ConversationsStack.Navigator screenOptions={{ header: Header }}>
      <ConversationsStack.Screen
        name='index'
        component={ConversationsScreen}
        options={{ title: intl.formatMessage(messages.heading) }}
      />
      <ConversationsStack.Screen
        name='mentions'
        component={ConversationMentionsScreen}
        options={{ title: intl.formatMessage(messages.mentionsHeader) }}
      />
    </ConversationsStack.Navigator>
  );
};

export { ConversationsStackScreen };
