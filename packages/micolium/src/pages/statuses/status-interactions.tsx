import { ActivityIndicator, Divider } from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { type TabDescriptor, TabView } from 'react-native-tab-view';

import { Account } from '@/components/accounts/account';
import { AccountsList } from '@/components/accounts/accounts-list';
import { StatusesList } from '@/components/statuses/statuses-list';
import { Emoji } from '@/components/ui/emoji';
import { EmptyMessage } from '@/components/ui/empty-message';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { TabBar } from '@/components/ui/tab-bar';
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

const StatusReactionsScreen = ({
  route: {
    params: { id, emoji: initialEmoji },
  },
}: NativeStackScreenProps<StatusStackParams, 'reactions'>) => {
  const intl = useIntl();

  const { data: status, refetch, isRefetching } = useStatus(id);
  const [index, setIndex] = useState(() => {
    const index = status?.emoji_reactions.findIndex(({ name }) => name === initialEmoji);
    if (index !== undefined && index !== -1) {
      return index + 1;
    }
    return 0;
  });

  if (!status) return <LoadingIndicator />;

  const routes: Array<{
    key: 'all' | string;
    title: string;
  }> = [
    {
      key: 'all',
      title: intl.formatMessage(messages.reactionsAll),
    },
  ];

  const options: Record<string, TabDescriptor<(typeof routes)[number]>> = {};

  const renderScene = (emoji: 'all' | string) => {
    let accounts: Array<IAccountWithReaction> = [];

    if (emoji === 'all') {
      accounts = status.emoji_reactions.flatMap(({ account_ids, name, url }) =>
        account_ids.map((account) => ({
          id: account,
          reaction: name,
          reactionUrl: url ?? undefined,
        })),
      );
    } else {
      const reactionRecord = status.emoji_reactions.find(({ name }) => name === emoji);

      if (reactionRecord)
        accounts = reactionRecord.account_ids.map((account) => ({
          id: account,
          reaction: emoji,
          reactionUrl: reactionRecord.url ?? undefined,
        }));
    }

    return (
      <FlashList
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

  for (const reaction of status.emoji_reactions) {
    routes.push({
      key: reaction.name,
      title: reaction.name,
    });
    options[reaction.name] = {
      label: () => <Emoji emoji={reaction.name} url={reaction.url} size={20} />,
    };
  }

  return (
    <TabView
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      options={options}
      renderTabBar={TabBar}
      renderScene={({ route }) => renderScene(route.key)}
      lazy
    />
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
