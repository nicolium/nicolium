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
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Account } from '@/components/accounts/account';
import { CurrentAccountAvatar } from '@/components/current-account-avatar';
import { Status } from '@/components/statuses/status';
import { EmptyMessage } from '@/components/ui/empty-message';
import { LoadMore } from '@/components/ui/load-more';
import { useFeatures } from '@/contexts/current-account-context';
import { useCanInteract } from '@/hooks/use-can-interact';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { type SelectedStatus, useStatus, useStatusContext } from '@/queries/statuses/use-status';
import {
  useStatusDislikes,
  useStatusFavourites,
  useStatusReblogs,
} from '@/queries/statuses/use-status-interactions';
import { useComposeActions } from '@/stores/compose';
import { useThread } from '@/stores/contexts';
import { useSetting } from '@/stores/settings';
import { useUiStoreActions } from '@/stores/ui';

import type { RootStackParams, StatusStackParams } from '../router';
import type { PaginatedResponseArray } from '@/queries/utils/make-paginated-response-query';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';

const messages = defineMessages({
  statusHeader: { id: 'column.status', defaultMessage: 'Post' },
  statusByAuthorHeader: { id: 'column.status.by_author', defaultMessage: 'Post by {name}' },
  reblogsHeader: { id: 'column.reblogs', defaultMessage: 'Reposts' },
  favouritesHeader: { id: 'column.favourites', defaultMessage: 'Likes' },
  dislikesHeader: { id: 'column.dislikes', defaultMessage: 'Dislikes' },
  mentionsHeader: { id: 'column.mentions', defaultMessage: 'Mentions' },
  countSubtitle: {
    id: 'column.count',
    defaultMessage: '{count, plural, one {# person} other {# people}}',
  },
});

const StatusHeader = ({ navigation, route, back }: NativeStackHeaderProps) => {
  const intl = useIntl();
  const { colors } = useTheme();
  const { data: status } = useStatus(route.params?.id);

  let title: string;
  let subtitle: string | undefined;
  switch (route.name) {
    case 'view':
      title = intl.formatMessage(status ? messages.statusByAuthorHeader : messages.statusHeader, {
        name: status?.account.display_name,
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
    case 'mentions':
      title = intl.formatMessage(messages.mentionsHeader);
      subtitle = intl.formatMessage(messages.countSubtitle, { count: status?.mentions.length });
      break;
    default:
      title = '';
  }

  return (
    <Appbar.Header
      style={{
        backgroundColor: colors.surfaceContainer,
      }}
    >
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      {subtitle ? (
        <View>
          <Text variant='titleMedium' numberOfLines={1}>
            {title}
          </Text>
          <Text style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{subtitle}</Text>
        </View>
      ) : (
        <Appbar.Content title={title} />
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

  const canReply = useCanInteract(status, 'can_reply');

  const features = useFeatures();
  const scopeUrl = useScopeUrl();

  if (!status || !canReply) return null;

  const handleReply = () => {
    if (!status) return;

    replyCompose(status, scopeUrl, features);
    openCompose();
  };

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
        <>
          <CurrentAccountAvatar />
          <Text>
            <FormattedMessage
              id='status.reply_to'
              defaultMessage='Reply to {name}'
              values={{ name: status?.account.display_name }}
            />
          </Text>
        </>
      </TouchableRipple>
    </View>
  );
};

interface IInteractionList {
  query: UseInfiniteQueryResult<PaginatedResponseArray<string>, Error>;
  emptyMessageText?: React.JSX.Element;
}

const InteractionList: React.FC<IInteractionList> = ({ query, emptyMessageText }) => {
  const autoloadMore = useSetting('timelines.autoloadMore');

  return (
    <FlashList
      data={query.data}
      renderItem={({ item }) => (
        <Account id={item} style={{ paddingVertical: 8, padding: 12 }} withLink withFollowButton />
      )}
      ItemSeparatorComponent={Divider}
      onEndReached={
        autoloadMore && query.hasNextPage && !query.isFetching ? query.fetchNextPage : undefined
      }
      onEndReachedThreshold={0.1}
      ListEmptyComponent={
        !query.isPending ? <EmptyMessage emptyMessageText={emptyMessageText} /> : null
      }
      ListFooterComponent={<LoadMore query={query} />}
    />
  );
};

const StatusViewScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'view'>) => {
  const { colors } = useTheme();
  const { data: status } = useStatus(id);
  const contextQuery = useStatusContext(id);
  const thread = useThread(id);

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
            <ActivityIndicator style={{ marginVertical: 8 }} />
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
    <InteractionList
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
    <InteractionList
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
    <InteractionList
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

const StatusStack = createNativeStackNavigator<StatusStackParams>();

const StatusStackScreen = (_props: NativeStackScreenProps<RootStackParams, 'status'>) => {
  return (
    <StatusStack.Navigator>
      <StatusStack.Screen
        name='view'
        component={StatusViewScreen}
        options={{ header: StatusHeader, title: 'Status' }}
      />
      <StatusStack.Screen
        name='reblogs'
        component={StatusReblogsScreen}
        options={{ header: StatusHeader, title: 'Reposts' }}
      />
      <StatusStack.Screen
        name='favourites'
        component={StatusFavouritesScreen}
        options={{ header: StatusHeader, title: 'Likes' }}
      />
      <StatusStack.Screen
        name='dislikes'
        component={StatusDislikesScreen}
        options={{ header: StatusHeader, title: 'Dislikes' }}
      />
      <StatusStack.Screen
        name='mentions'
        component={StatusMentionsScreen}
        options={{ header: StatusHeader, title: 'Mentions' }}
      />
    </StatusStack.Navigator>
  );
};

export { StatusViewScreen, StatusStackScreen };
