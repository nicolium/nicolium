import {
  ActivityIndicator,
  Appbar,
  Button,
  Checkbox,
  Dialog,
  Divider,
  List,
  Text,
  useTheme,
} from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackHeaderProps,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { ChecksIcon, FunnelIcon, UserPlusIcon } from 'phosphor-react-native';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabView, TabBar } from 'react-native-tab-view';

import { Notification } from '@/components/notification';
import { EmptyMessage } from '@/components/ui/empty-message';
import { HeaderIconButton } from '@/components/ui/header-icon-button';
import { iconHelper } from '@/components/ui/icon';
import { LoadMore } from '@/components/ui/load-more';
import { useFeatures } from '@/contexts/current-account-context';
import { useFollowRequestsCount } from '@/queries/accounts/use-follow-requests';
import {
  useMarkNotificationsReadMutation,
  useNotifications,
  useNotificationsUnreadCount,
} from '@/queries/notifications/use-notifications';
import { useSetting, useSettingsActions } from '@/stores/settings';

import type { NotificationsStackParams } from '../router';

const messages = defineMessages({
  tabAll: { id: 'notifications.filter.all', defaultMessage: 'All' },
  tabFiltered: { id: 'notifications.filter.all.filtered', defaultMessage: 'Filtered' },
  tabMentions: { id: 'notifications.filter_mentions', defaultMessage: 'Mentions' },
  followRequests: {
    id: 'navigation_bar.follow_requests.count',
    defaultMessage: '{count, plural, one {# follow request} other {# follow requests}}',
  },
});

const NOTIFICATION_TABS = {
  all: 0,
  mentions: 1,
} as const;

const ALL_FILTERS = [
  'mention',
  'favourite',
  'reblog',
  'poll',
  'status',
  'follow',
  'events',
] as const;

interface IFiltersDialog {
  visible: boolean;
  setVisible: (value: boolean) => void;
}

const FiltersDialog: React.FC<IFiltersDialog> = ({ visible, setVisible }) => {
  const { colors } = useTheme();
  const features = useFeatures();

  const filters = useSetting('notifications.filters');
  const { update } = useSettingsActions();

  const [newFilters, setNewFilters] = useState<typeof filters>(() => {
    if (filters.length === 0) return ALL_FILTERS;
    return filters;
  });

  const getStatus = (key: (typeof filters)[0]) => {
    if (newFilters.length === 0) return 'checked';
    if (newFilters.includes(key)) return 'checked';
    return 'unchecked';
  };

  const toggleFilters = (key: (typeof filters)[0]) => () => {
    if (newFilters.includes(key)) {
      setNewFilters((filters) => filters.filter((value) => value !== key));
    } else {
      setNewFilters((filters) => [...filters, key]);
    }
  };

  return (
    <Dialog visible={visible} onDismiss={() => setVisible(false)}>
      <Dialog.Title>
        <FormattedMessage
          id='notifications.filters.heading'
          defaultMessage='Visible notifications'
        />
      </Dialog.Title>
      <Dialog.ScrollArea>
        <ScrollView>
          <List.Item
            title={
              <FormattedMessage id='notifications.filters.mention' defaultMessage='Mentions' />
            }
            left={() => (
              <Checkbox status={getStatus('mention')} onPress={toggleFilters('mention')} />
            )}
            onPress={toggleFilters('mention')}
          />
          <List.Item
            title={<FormattedMessage id='notifications.filters.favourite' defaultMessage='Likes' />}
            left={() => (
              <Checkbox status={getStatus('favourite')} onPress={toggleFilters('favourite')} />
            )}
            onPress={toggleFilters('favourite')}
          />
          <List.Item
            title={<FormattedMessage id='notifications.filters.reblog' defaultMessage='Reposts' />}
            left={() => <Checkbox status={getStatus('reblog')} onPress={toggleFilters('reblog')} />}
            onPress={toggleFilters('reblog')}
          />
          <List.Item
            title={<FormattedMessage id='notifications.filters.poll' defaultMessage='Polls' />}
            left={() => <Checkbox status={getStatus('poll')} onPress={toggleFilters('poll')} />}
            onPress={toggleFilters('poll')}
          />
          {features.accountNotifies && (
            <List.Item
              title={
                <FormattedMessage
                  id='notifications.filters.status'
                  defaultMessage='Account subscriptions'
                />
              }
              left={() => (
                <Checkbox status={getStatus('status')} onPress={toggleFilters('status')} />
              )}
              onPress={toggleFilters('status')}
            />
          )}
          <List.Item
            title={<FormattedMessage id='notifications.filters.follow' defaultMessage='Follows' />}
            left={() => <Checkbox status={getStatus('follow')} onPress={toggleFilters('follow')} />}
            onPress={toggleFilters('follow')}
          />
          {features.events && (
            <List.Item
              title={<FormattedMessage id='notifications.filters.events' defaultMessage='Events' />}
              left={() => (
                <Checkbox status={getStatus('events')} onPress={toggleFilters('events')} />
              )}
              onPress={toggleFilters('events')}
            />
          )}
        </ScrollView>
      </Dialog.ScrollArea>
      <Dialog.Actions>
        <Button onPress={() => setVisible(false)}>
          <FormattedMessage id='common.cancel' defaultMessage='Cancel' />
        </Button>
        <View style={{ flex: 1 }} />
        <Button
          onPress={() => {
            setVisible(false);
            update('notifications.filters', []);
          }}
          textColor={colors.error}
        >
          <FormattedMessage id='notifications.filters.reset' defaultMessage='Reset' />
        </Button>
        <Button
          onPress={
            newFilters.length === 0
              ? undefined
              : () => {
                  setVisible(false);
                  update(
                    'notifications.filters',
                    newFilters.length === ALL_FILTERS.length ? [] : newFilters,
                  );
                }
          }
          disabled={newFilters.length === 0}
        >
          <FormattedMessage id='common.save' defaultMessage='Save' />
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const FollowRequestsButton = () => {
  const intl = useIntl();
  const count = useFollowRequestsCount();
  const navigation = useNavigation();

  if (!count) return null;

  return (
    <HeaderIconButton
      icon={UserPlusIcon}
      onPress={() =>
        navigation.navigate('settings', {
          screen: 'follow_requests',
        })
      }
      accessibilityLabel={intl.formatMessage(messages.followRequests, { count })}
      badge={count}
    />
    // <Badge style={{ position: 'absolute', top: 4, right: 4 }}>{count}</Badge>
  );
};

const NotificationsMarkReadButton = () => {
  const notificationCount = useNotificationsUnreadCount();
  const { mutate: markNotificationsRead } = useMarkNotificationsReadMutation();

  const { data: notifications = [] } = useNotifications([]);

  const handleClick = () => {
    markNotificationsRead(
      notifications[0]?.page_max_id ?? notifications[0]?.most_recent_notification_id,
    );
  };

  return <HeaderIconButton icon={ChecksIcon} disabled={!notificationCount} onPress={handleClick} />;
};

const NotificationsHeader = ({ route }: NativeStackHeaderProps) => {
  const { colors } = useTheme();

  const [showFiltersDialog, setShowFiltersDialog] = React.useState(false);

  return (
    <>
      <Appbar.Header
        style={{
          backgroundColor: colors.surfaceContainer,
        }}
      >
        <Appbar.Content
          title={
            <Text variant='titleLarge'>
              <FormattedMessage id='column.notifications' defaultMessage='Notifications' />
            </Text>
          }
        />
        {(!route.params ||
          (route.params as NotificationsStackParams['view'] | undefined)?.tab === 'all') && (
          <HeaderIconButton icon={FunnelIcon} onPress={() => setShowFiltersDialog(true)} />
        )}
        <FollowRequestsButton />
        <NotificationsMarkReadButton />
      </Appbar.Header>
      <FiltersDialog visible={showFiltersDialog} setVisible={setShowFiltersDialog} />
    </>
  );
};

const LoadingIndicator = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size='large' />
  </View>
);

const NotificationsScreen = ({
  navigation,
}: NativeStackScreenProps<NotificationsStackParams, 'view'>) => {
  const intl = useIntl();
  const { colors } = useTheme();

  const filters = useSetting('notifications.filters');

  const [currentTab, setCurrentTab] = React.useState(0);

  const notificationsQuery = useNotifications(filters, currentTab === NOTIFICATION_TABS.all);
  const mentionsNotificationsQuery = useNotifications(
    ['mention'],
    currentTab === NOTIFICATION_TABS.mentions,
  );

  const autoloadMore = useSetting('timelines.autoloadMore');
  const { bottom: bottomInset } = useSafeAreaInsets();

  const handleChangeIndex = (index: number) => {
    setCurrentTab(index);
    navigation.setParams({ tab: index ? 'mentions' : 'all' });
  };

  const renderNotifications = (tab: 'all' | 'mentions') => {
    const query = tab === 'all' ? notificationsQuery : mentionsNotificationsQuery;

    if (query.isPending) return <LoadingIndicator />;

    return (
      <FlashList
        data={query.data}
        renderItem={({ item }) => (
          <Notification key={item.most_recent_notification_id} notification={item} />
        )}
        ItemSeparatorComponent={Divider}
        onRefresh={query.refetch}
        refreshing={query.isRefetching}
        onEndReached={
          autoloadMore && query.hasNextPage && !query.isFetching ? query.fetchNextPage : undefined
        }
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          !query.isPending ? (
            tab === 'all' ? (
              <EmptyMessage
                emptyMessageText={
                  <FormattedMessage
                    id='empty_column.notifications'
                    defaultMessage='You don’t have any notifications yet. Interact with others to start the conversation.'
                  />
                }
              />
            ) : (
              <EmptyMessage
                emptyMessageText={
                  <FormattedMessage
                    id='empty_column.notifications_filtered'
                    defaultMessage='You don’t have any notifications of this type yet.'
                  />
                }
              />
            )
          ) : null
        }
        ListFooterComponent={<LoadMore query={query} />}
        contentContainerStyle={{ paddingBottom: bottomInset }}
        scrollIndicatorInsets={{ bottom: bottomInset }}
      />
    );
  };

  const routes: Array<{
    key: 'all' | 'mentions';
    title: string;
  }> = [
    {
      key: 'all',
      title: intl.formatMessage(filters.length ? messages.tabFiltered : messages.tabAll),
    },
    { key: 'mentions', title: intl.formatMessage(messages.tabMentions) },
  ];

  return (
    <TabView
      navigationState={{ index: currentTab, routes }}
      onIndexChange={handleChangeIndex}
      renderScene={({ route }) => renderNotifications(route.key)}
      renderTabBar={(props) => (
        <TabBar {...props} style={{ backgroundColor: colors.surfaceContainer }} />
      )}
    />
  );
};

const NotificationsStack = createNativeStackNavigator<NotificationsStackParams>();

const NotificationsStackScreen = () => {
  return (
    <NotificationsStack.Navigator>
      <NotificationsStack.Screen
        name='view'
        component={NotificationsScreen}
        options={{ header: NotificationsHeader }}
      />
    </NotificationsStack.Navigator>
  );
};

export { NotificationsStackScreen };
