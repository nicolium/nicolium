import {
  ActivityIndicator,
  Appbar,
  Divider,
  Text,
  TouchableRipple,
  useTheme,
} from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackHeaderProps,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { GlassView } from 'expo-glass-effect';
import React, { useState } from 'react';
import { defineMessages, FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type TabDescriptor, TabView } from 'react-native-tab-view';

import { Account } from '@/components/accounts/account';
import { AccountsList } from '@/components/accounts/accounts-list';
import { CurrentAccountAvatar } from '@/components/current-account-avatar';
import { Status } from '@/components/statuses/status';
import { StatusMedia } from '@/components/statuses/status-media';
import { StatusesList } from '@/components/statuses/statuses-list';
import { Emoji } from '@/components/ui/emoji';
import { Emojify } from '@/components/ui/emojify';
import { EmptyMessage } from '@/components/ui/empty-message';
import { HeaderBackButton } from '@/components/ui/header-icon-button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { StyledHtml } from '@/components/ui/styled-html';
import { TabBar } from '@/components/ui/tab-bar';
import { useFeatures } from '@/contexts/current-account-context';
import { useCanInteract } from '@/hooks/use-can-interact';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { type SelectedStatus, useStatus, useStatusContext } from '@/queries/statuses/use-status';
import { useStatusHistory } from '@/queries/statuses/use-status-history';
import {
  useStatusDislikes,
  useStatusFavourites,
  useStatusReblogs,
} from '@/queries/statuses/use-status-interactions';
import { useStatusQuotes } from '@/queries/statuses/use-status-quotes';
import { useComposeActions } from '@/stores/compose';
import { useThread } from '@/stores/contexts';
import { useUiStoreActions } from '@/stores/ui';

import type { RootStackParams, StatusStackParams } from '../router';

const messages = defineMessages({
  statusHeader: { id: 'column.status', defaultMessage: 'Post' },
  statusByAuthorHeader: { id: 'column.status.by_author', defaultMessage: 'Post by {name}' },
  reblogsHeader: { id: 'column.reblogs', defaultMessage: 'Reposts' },
  favouritesHeader: { id: 'column.favourites', defaultMessage: 'Likes' },
  dislikesHeader: { id: 'column.dislikes', defaultMessage: 'Dislikes' },
  reactionsHeader: { id: 'column.reactions', defaultMessage: 'Reactions' },
  mentionsHeader: { id: 'column.mentions', defaultMessage: 'Mentions' },
  quotesHeader: { id: 'column.quotes', defaultMessage: 'Post quotes' },
  historyHeader: { id: 'compare_history_modal.header', defaultMessage: 'Edit history' },
  countSubtitle: {
    id: 'column.count',
    defaultMessage: '{count, plural, one {# person} other {# people}}',
  },
  reactionsCountSubtitle: {
    id: 'column.reactions.count',
    defaultMessage: '{count, plural, one {# reaction} other {# reactions}}',
  },
  reactionsAll: { id: 'reactions.all', defaultMessage: 'All' },
});

const StatusHeader = ({ navigation, route, back }: NativeStackHeaderProps) => {
  const intl = useIntl();
  const { colors } = useTheme();
  const { data: status } = useStatus((route.params as StatusStackParams['view'] | undefined)?.id);

  let title: string | Array<React.ReactNode>;
  let subtitle: string | undefined;
  switch (route.name) {
    case 'view':
      title = intl.formatMessage(status ? messages.statusByAuthorHeader : messages.statusHeader, {
        name: status?.account ? (
          <Emojify text={status.account.display_name} emojis={status.account.emojis} />
        ) : undefined,
      });
      break;
    case 'reblogs':
      title = intl.formatMessage(messages.reblogsHeader);
      subtitle = intl.formatMessage(messages.countSubtitle, { count: status?.reblogs_count });
      break;
    case 'favourites':
      title = intl.formatMessage(messages.favouritesHeader);
      subtitle = intl.formatMessage(messages.countSubtitle, { count: status?.favourites_count });
      break;
    case 'dislikes':
      title = intl.formatMessage(messages.dislikesHeader);
      subtitle = intl.formatMessage(messages.countSubtitle, { count: status?.dislikes_count });
      break;
    case 'reactions': {
      title = intl.formatMessage(messages.reactionsHeader);
      const count = status?.emoji_reactions.reduce<number>(
        (prev, cur) => prev + (cur.count || 0),
        0,
      );
      if (count) {
        subtitle = intl.formatMessage(messages.reactionsCountSubtitle, {
          count,
        });
      }
      break;
    }
    case 'mentions':
      title = intl.formatMessage(messages.mentionsHeader);
      subtitle = intl.formatMessage(messages.countSubtitle, { count: status?.mentions.length });
      break;
    case 'history':
      title = intl.formatMessage(messages.historyHeader);
      break;
    default:
      title = '';
  }

  return (
    <Appbar.Header style={{ backgroundColor: colors.surfaceContainer }}>
      {back ? <HeaderBackButton onPress={navigation.goBack} /> : null}
      {subtitle ? (
        <View>
          <Text variant='titleMedium' numberOfLines={1}>
            {title}
          </Text>
          <Text style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{subtitle}</Text>
        </View>
      ) : (
        <Appbar.Content
          title={
            typeof title === 'string' ? (
              title
            ) : (
              <Text variant='titleLarge' numberOfLines={1}>
                {title}
              </Text>
            )
          }
        />
      )}
    </Appbar.Header>
  );
};

const MaybeDivider: React.FC<{ statusId: string }> = ({ statusId }) => {
  const { data: status } = useStatus(statusId);

  if (status?.replies_count) return null;

  return <Divider />;
};

interface IReplyBox {
  status?: SelectedStatus;
}

const ReplyBox: React.FC<IReplyBox> = ({ status }) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { replyCompose } = useComposeActions();
  const { openCompose } = useUiStoreActions();
  const glassEffect = useEnableLiquidGlass();

  const canReply = useCanInteract(status, 'can_reply');

  const features = useFeatures();
  const scopeUrl = useScopeUrl();

  if (!status || !canReply) return null;

  const handleReply = () => {
    if (!status) return;

    replyCompose(status, scopeUrl, features);
    openCompose();
  };

  const content = (
    <>
      <CurrentAccountAvatar />
      <Text>
        <FormattedMessage
          id='compose.reply_indicator'
          defaultMessage='Reply to @{acct}'
          values={{
            acct: status.account.acct,
          }}
        />
      </Text>
    </>
  );

  if (glassEffect) {
    return (
      <Pressable
        onPress={handleReply}
        style={{
          marginTop: 8,
          marginBottom: 8 + bottomInset,
          marginHorizontal: 16,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <GlassView
          style={{
            gap: 8,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            backgroundColor: colors.surfaceVariant,
            borderRadius: 20,
            overflow: 'hidden',
          }}
          glassEffectStyle='clear'
          isInteractive
        >
          {content}
        </GlassView>
      </Pressable>
    );
  }

  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainer,
        paddingTop: 8,
        paddingBottom: 8 + bottomInset,
        paddingHorizontal: 16,
        borderTopColor: colors.surfaceVariant,
        borderTopWidth: 1,
      }}
    >
      <TouchableRipple
        style={{
          gap: 8,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 8,
          backgroundColor: colors.surfaceVariant,
          borderRadius: 20,
          overflow: 'hidden',
        }}
        onPress={handleReply}
      >
        {content}
      </TouchableRipple>
    </View>
  );
};

const StatusViewScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'view'>) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: status } = useStatus(id);
  const contextQuery = useStatusContext(id);
  const thread = useThread(id);
  const glassEffect = useEnableLiquidGlass();

  return (
    <>
      <FlashList
        data={thread}
        renderItem={({ item }) => (
          <Status
            id={item}
            context='thread'
            withLink={item !== id}
            style={item === id ? { backgroundColor: colors.surfaceContainerLow } : undefined}
            detailed={item === id}
            isConnectedBottom={(status) => item !== id && status.replies_count > 0}
          />
        )}
        ItemSeparatorComponent={({ leadingItem }) =>
          leadingItem === id ? <Divider /> : <MaybeDivider statusId={leadingItem} />
        }
        initialScrollIndex={thread.indexOf(id)}
        ListFooterComponent={
          contextQuery.isPending && !status?.in_reply_to_id ? (
            <ActivityIndicator
              style={{
                marginVertical: 8,
                marginBottom: glassEffect ? 64 + bottomInset : undefined,
              }}
            />
          ) : glassEffect ? (
            <View style={{ height: 56 + bottomInset }} />
          ) : undefined
        }
        ListHeaderComponent={
          contextQuery.isPending && status?.in_reply_to_id ? (
            <ActivityIndicator style={{ marginVertical: 8 }} />
          ) : undefined
        }
        onRefresh={contextQuery.refetch}
        refreshing={contextQuery.isRefetching}
      />
      <ReplyBox status={status} />
    </>
  );
};

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

const StatusHistoryScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'history'>) => {
  const { colors } = useTheme();
  const { data: status } = useStatus(id);
  const { data: versions, isPending } = useStatusHistory(id);

  return (
    <FlashList
      data={versions}
      keyExtractor={(version) => version.created_at}
      renderItem={({ item: version, index }) => (
        <View style={{ padding: 16, gap: 8 }}>
          <Text variant='labelLarge' style={{ color: colors.onSurfaceVariant }}>
            {versions && index === versions.length - 1 && (
              <>
                <FormattedMessage id='compare_history_modal.original' defaultMessage='Original' />
                {' · '}
              </>
            )}
            <FormattedDate
              value={new Date(version.created_at)}
              hour12
              year='numeric'
              month='short'
              day='2-digit'
              hour='numeric'
              minute='2-digit'
            />
          </Text>
          {version.spoiler_text.length > 0 && (
            <Text variant='titleSmall'>
              <Emojify text={version.spoiler_text} emojis={version.emojis} />
            </Text>
          )}
          <StyledHtml html={version.content} emojis={version.emojis} mentions={status?.mentions} />
          {version.poll && (
            <View style={{ gap: 8 }}>
              {version.poll.options.map((option) => (
                <View
                  key={option.title}
                  style={{
                    padding: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderColor: colors.outlineVariant,
                    borderWidth: 1,
                  }}
                >
                  <Text numberOfLines={1}>
                    <Emojify text={option.title} emojis={version.emojis} />
                  </Text>
                </View>
              ))}
            </View>
          )}
          <StatusMedia status={version} compact />
        </View>
      )}
      ItemSeparatorComponent={Divider}
      ListFooterComponent={
        isPending ? <ActivityIndicator style={{ marginVertical: 8 }} size='large' /> : undefined
      }
    />
  );
};

const StatusStack = createNativeStackNavigator<StatusStackParams>();

const StatusStackScreen = (_props: NativeStackScreenProps<RootStackParams, 'status'>) => {
  return (
    <StatusStack.Navigator screenOptions={{ header: StatusHeader }}>
      <StatusStack.Screen name='view' component={StatusViewScreen} />
      <StatusStack.Screen name='reblogs' component={StatusReblogsScreen} />
      <StatusStack.Screen name='favourites' component={StatusFavouritesScreen} />
      <StatusStack.Screen name='dislikes' component={StatusDislikesScreen} />
      <StatusStack.Screen name='reactions' component={StatusReactionsScreen} />
      <StatusStack.Screen name='mentions' component={StatusMentionsScreen} />
      <StatusStack.Screen name='quotes' component={StatusQuotesScreen} />
      <StatusStack.Screen name='history' component={StatusHistoryScreen} />
    </StatusStack.Navigator>
  );
};

export { StatusViewScreen, StatusStackScreen };
