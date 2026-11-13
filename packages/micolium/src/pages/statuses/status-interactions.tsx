import { ActivityIndicator, Divider, Text } from '@mkljczk/react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useScrollToTop } from '@react-navigation/native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';

import { Account } from '@/components/accounts/account';
import { AccountsList } from '@/components/accounts/accounts-list';
import { StatusesList } from '@/components/statuses/statuses-list';
import { Emoji } from '@/components/ui/emoji';
import { EmptyMessage } from '@/components/ui/empty-message';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useTabBarProps } from '@/components/ui/tab-bar';
import { useStatus } from '@/queries/statuses/use-status';
import {
  useStatusDislikes,
  useStatusFavourites,
  useStatusReblogs,
} from '@/queries/statuses/use-status-interactions';
import { useStatusQuotes } from '@/queries/statuses/use-status-quotes';

import type { StatusStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({ reactionsAll: { id: 'reactions.all', defaultMessage: 'All' } });

const StatusReblogsScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'reblogs'>) => {
  const query = useStatusReblogs(id);

  return (
    <AccountsList
      query={query}
      emptyMessageText={
        <FormattedMessage
          id='status.reblogs.empty'
          defaultMessage='No one has reposted this post yet. When someone does, they will show up here.'
        />
      }
    />
  );
};

const StatusFavouritesScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'favourites'>) => {
  const query = useStatusFavourites(id);

  return (
    <AccountsList
      query={query}
      emptyMessageText={
        <FormattedMessage
          id='empty_column.favourites'
          defaultMessage='No one has liked this post yet. When someone does, they will show up here.'
        />
      }
    />
  );
};

const StatusDislikesScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'dislikes'>) => {
  const query = useStatusDislikes(id);

  return (
    <AccountsList
      query={query}
      emptyMessageText={
        <FormattedMessage
          id='empty_column.dislikes'
          defaultMessage='No one has disliked this post yet. When someone does, they will show up here.'
        />
      }
    />
  );
};

interface IAccountWithReaction {
  id: string;
  reaction: string;
  reactionUrl?: string;
}

interface IReactionsList {
  id: string;
  emoji: 'all' | string;
}

const ReactionsList: React.FC<IReactionsList> = ({ id, emoji }) => {
  const { data: status, refetch, isRefetching } = useStatus(id);
  const ref = React.useRef<FlashListRef<IAccountWithReaction>>(null);
  useScrollToTop(ref);

  let accounts: Array<IAccountWithReaction> = [];

  if (emoji === 'all') {
    accounts =
      status?.emoji_reactions.flatMap(({ account_ids, name, url }) =>
        account_ids.map((account) => ({
          id: account,
          reaction: name,
          reactionUrl: url ?? undefined,
        })),
      ) ?? [];
  } else {
    const reactionRecord = status?.emoji_reactions.find(({ name }) => name === emoji);

    if (reactionRecord)
      accounts = reactionRecord.account_ids.map((account) => ({
        id: account,
        reaction: emoji,
        reactionUrl: reactionRecord.url ?? undefined,
      }));
  }

  return (
    <FlashList
      ref={ref}
      data={accounts}
      renderItem={({ item }) => (
        <Account
          id={item.id}
          style={{ paddingVertical: 8, padding: 12 }}
          withLink
          badge={<Emoji emoji={item.reaction} url={item.reactionUrl} />}
        />
      )}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={Divider}
      onEndReachedThreshold={0.1}
      onRefresh={refetch}
      refreshing={isRefetching}
    />
  );
};

const ReactionsTabs = createMaterialTopTabNavigator<Record<string, undefined>>();

const StatusReactionsScreen = ({
  route: {
    params: { id, emoji: initialEmoji },
  },
}: NativeStackScreenProps<StatusStackParams, 'reactions'>) => {
  const intl = useIntl();
  const tabBarProps = useTabBarProps();

  const { data: status } = useStatus(id);

  if (!status) return <LoadingIndicator />;

  return (
    <ReactionsTabs.Navigator
      {...tabBarProps}
      initialRouteName={
        status.emoji_reactions.some(({ name }) => name === initialEmoji) ? initialEmoji : 'all'
      }
    >
      <ReactionsTabs.Screen
        name='all'
        options={{ title: intl.formatMessage(messages.reactionsAll) }}
      >
        {() => <ReactionsList id={id} emoji='all' />}
      </ReactionsTabs.Screen>
      {status.emoji_reactions.map((reaction) => (
        <ReactionsTabs.Screen
          key={reaction.name}
          name={reaction.name}
          options={{
            title: reaction.name,
            tabBarLabel: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Emoji emoji={reaction.name} url={reaction.url} size={20} />
                <Text>{reaction.count}</Text>
              </View>
            ),
          }}
        >
          {() => <ReactionsList id={id} emoji={reaction.name} />}
        </ReactionsTabs.Screen>
      ))}
    </ReactionsTabs.Navigator>
  );
};

const StatusMentionsScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'mentions'>) => {
  const { data: status, isPending } = useStatus(id);

  return (
    <FlashList
      data={status?.mentions.map(({ id }) => id)}
      renderItem={({ item }) => (
        <Account id={item} style={{ paddingVertical: 8, padding: 12 }} withLink />
      )}
      ItemSeparatorComponent={Divider}
      ListFooterComponent={
        isPending ? <ActivityIndicator style={{ marginVertical: 8 }} size='large' /> : undefined
      }
    />
  );
};

const StatusQuotesScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'quotes'>) => {
  const quotesQuery = useStatusQuotes(id);

  return (
    <StatusesList
      query={quotesQuery}
      emptyMessageText={
        <EmptyMessage
          emptyMessageText={
            <FormattedMessage
              id='empty_column.quotes'
              defaultMessage='This post has not been quoted yet.'
            />
          }
        />
      }
    />
  );
};

export {
  StatusReblogsScreen,
  StatusFavouritesScreen,
  StatusDislikesScreen,
  StatusReactionsScreen,
  StatusMentionsScreen,
  StatusQuotesScreen,
};
