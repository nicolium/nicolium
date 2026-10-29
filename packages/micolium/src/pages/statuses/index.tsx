import { Appbar, Text, useTheme } from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackHeaderProps,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { View } from 'react-native';

import { Emojify } from '@/components/ui/emojify';
import { HeaderBackButton } from '@/components/ui/header-icon-button';
import { useStatus } from '@/queries/statuses/use-status';

import { StatusHistoryScreen } from './status-history';
import {
  StatusDislikesScreen,
  StatusFavouritesScreen,
  StatusMentionsScreen,
  StatusQuotesScreen,
  StatusReactionsScreen,
  StatusReblogsScreen,
} from './status-interactions';
import { ThreadExpandPostsButton, ThreadScreen } from './thread';

import type { RootStackParams, StatusStackParams } from '@/router/router';

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
    <Appbar.Header mode='small' style={{ backgroundColor: colors.surfaceContainer }}>
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
      {status && route.name === 'view' && <ThreadExpandPostsButton id={status.id} />}
    </Appbar.Header>
  );
};

const StatusStack = createNativeStackNavigator<StatusStackParams>();

const StatusStackScreen = (_props: NativeStackScreenProps<RootStackParams, 'status'>) => {
  return (
    <StatusStack.Navigator screenOptions={{ header: StatusHeader }}>
      <StatusStack.Screen name='view' component={ThreadScreen} />
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

export { StatusStackScreen };
