import { Toggle } from '@expo/ui/swift-ui';
import { Appbar, Checkbox, Divider, List, Text, useTheme } from '@mkljczk/react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
  getFocusedRouteNameFromRoute,
  useNavigation,
  useScrollToTop,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
  type NativeStackHeaderProps,
} from '@react-navigation/native-stack';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { ArchiveIcon } from 'phosphor-react-native/src/icons/Archive';
import { ChecksIcon } from 'phosphor-react-native/src/icons/Checks';
import { FunnelIcon } from 'phosphor-react-native/src/icons/Funnel';
import { HeartHalfIcon } from 'phosphor-react-native/src/icons/HeartHalf';
import { UserPlusIcon } from 'phosphor-react-native/src/icons/UserPlus';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, type MessageDescriptor, useIntl } from 'react-intl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Notification } from '@/components/notification';
import { CornerInset } from '@/components/ui/corner-inset';
import { DialogOrSheet } from '@/components/ui/dialog-or-sheet';
import { EmptyMessage } from '@/components/ui/empty-message';
import { Header } from '@/components/ui/header';
import { HeaderIconButton } from '@/components/ui/header-icon-button';
import { LoadMore } from '@/components/ui/load-more';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { SwiftUIList } from '@/components/ui/swift-ui-list';
import { useTabBarProps } from '@/components/ui/tab-bar';
import { useFeatures } from '@/contexts/current-account-context';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useFollowRequestsCount } from '@/queries/accounts/use-follow-requests';
import { useNotificationsMarker } from '@/queries/markers/use-markers';
import { useNotificationPolicy } from '@/queries/notifications/use-notification-policy';
import {
  useMarkNotificationsReadMutation,
  useNotifications,
  useNotificationsUnreadCount,
} from '@/queries/notifications/use-notifications';
import { useInteractionRequestsCount } from '@/queries/statuses/use-interaction-requests';
import { useSetting, useSettingsActions } from '@/stores/settings';
import { compareId } from '@/utils/comparators';

import { NotificationRequestScreen, NotificationRequestsScreen } from './notification-requests';

import type { NotificationsStackParams, NotificationsTabsParams } from '@/router/router';
import type { NotificationGroup } from 'pl-api';

const messages = defineMessages({
  tabAll: { id: 'notifications.filter.all', defaultMessage: 'All' },
  tabFiltered: { id: 'notifications.filter.all.filtered', defaultMessage: 'Filtered' },
  tabMentions: { id: 'notifications.filter_mentions', defaultMessage: 'Mentions' },
  followRequests: {
    id: 'navigation_bar.follow_requests.count',
    defaultMessage: '{count, plural, one {# follow request} other {# follow requests}}',
  },
  interactionRequests: {
    id: 'navigation_bar.interaction_requests.count',
    defaultMessage: '{count, plural, one {# interaction request} other {# interaction requests}}',
  },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  reset: { id: 'notifications.filters.reset', defaultMessage: 'Reset' },
  save: { id: 'common.save', defaultMessage: 'Save' },
  markRead: {
    id: 'notifications.mark_read',
    defaultMessage: 'Mark notifications read',
  },
  showFilters: { id: 'notifications.filter.menu', defaultMessage: 'Filter notifications' },
  notificationsHeading: { id: 'column.notifications', defaultMessage: 'Notifications' },
  requestsHeading: {
    id: 'column.notification_requests',
    defaultMessage: 'Filtered notifications',
  },
  requestHeading: { id: 'column.notification_request', defaultMessage: 'Pending notifications' },
  pendingRequests: {
    id: 'filtered_notifications_banner.pending_requests',
    defaultMessage:
      'You have {notifications, plural, =0 {no pending notifications} one {one pending notification} other {# pending notifications}} from {requests, plural, =0 {no one} one {one person} other {# people}} you may know',
  },
});

const filtersMessages: Record<(typeof ALL_FILTERS)[number], MessageDescriptor> = defineMessages({
  mention: { id: 'notifications.filters.mention', defaultMessage: 'Mentions' },
  favourite: { id: 'notifications.filters.favourite', defaultMessage: 'Likes' },
  reblog: { id: 'notifications.filters.reblog', defaultMessage: 'Reposts' },
  poll: { id: 'notifications.filters.poll', defaultMessage: 'Polls' },
  status: { id: 'notifications.filters.status', defaultMessage: 'Account subscriptions' },
  follow: { id: 'notifications.filters.follow', defaultMessage: 'Follows' },
  events: { id: 'notifications.filters.events', defaultMessage: 'Events' },
});

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
  const glassEffect = useEnableLiquidGlass();
  const intl = useIntl();
  const features = useFeatures();

  const filters = useSetting('notifications.filters');
  const { update } = useSettingsActions();

  const [newFilters, setNewFilters] = useState<typeof filters>(() => {
    if (filters.length === 0) return ALL_FILTERS;
    return filters;
  });

  const getBooleanStatus = (key: (typeof filters)[0]) => {
    if (newFilters.length === 0) return true;
    if (newFilters.includes(key)) return true;
    return false;
  };

  const getStatus = (key: (typeof filters)[0]) => (getBooleanStatus(key) ? 'checked' : 'unchecked');

  const toggleFilters = (key: (typeof filters)[0]) => () => {
    if (newFilters.includes(key)) {
      setNewFilters((filters) => filters.filter((value) => value !== key));
    } else {
      setNewFilters((filters) => [...filters, key]);
    }
  };

  const availableFilters = React.useMemo(() => {
    const menu: Array<(typeof ALL_FILTERS)[number]> = ['mention', 'favourite', 'reblog', 'poll'];

    if (features.accountNotifies) menu.push('status');
    menu.push('follow');
    if (features.events) menu.push('events');

    return menu;
  }, [features]);

  return (
    <DialogOrSheet
      title={
        <FormattedMessage
          id='notifications.filters.heading'
          defaultMessage='Visible notifications'
        />
      }
      actions={[
        {
          icon: 'xmark',
          label: intl.formatMessage(messages.cancel),
          onPress: () => setVisible(false),
        },
        {
          label: intl.formatMessage(messages.reset),
          onPress: () => {
            setVisible(false);
            update('notifications.filters', []);
          },
          destructive: true,
        },
        {
          icon: 'checkmark',
          label: intl.formatMessage(messages.save),
          onPress: () => {
            setVisible(false);
            update(
              'notifications.filters',
              newFilters.length === ALL_FILTERS.length ? [] : newFilters,
            );
          },
          confirm: true,
          disabled: newFilters.length === 0,
        },
      ]}
      visible={visible}
      handleDismiss={() => setVisible(false)}
    >
      {glassEffect ? (
        <SwiftUIList>
          {availableFilters.map((filter) => (
            <Toggle
              key={filter}
              isOn={getBooleanStatus(filter)}
              onIsOnChange={toggleFilters(filter)}
              label={intl.formatMessage(filtersMessages[filter])}
            />
          ))}
        </SwiftUIList>
      ) : (
        availableFilters.map((filter) => (
          <List.Item
            key={filter}
            title={intl.formatMessage(filtersMessages[filter])}
            left={() => <Checkbox status={getStatus(filter)} onPress={toggleFilters(filter)} />}
            onPress={toggleFilters(filter)}
          />
        ))
      )}
    </DialogOrSheet>
  );
};

const InteractionRequestsButton = () => {
  const intl = useIntl();
  const count = useInteractionRequestsCount().data ?? 0;
  const navigation = useNavigation();

  if (!count) return null;

  return (
    <HeaderIconButton
      icon={HeartHalfIcon}
      onPress={() =>
        navigation.navigate('settings', {
          screen: 'interaction_requests',
        })
      }
      accessibilityLabel={intl.formatMessage(messages.interactionRequests, { count })}
      badge={count}
    />
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
  );
};

const FilteredNotificationsButton = () => {
  const intl = useIntl();
  const navigation = useNavigation();
  const { data: policy } = useNotificationPolicy();

  if (!policy || !policy.summary.pending_requests_count) return null;

  return (
    <HeaderIconButton
      icon={ArchiveIcon}
      onPress={() =>
        navigation.navigate('app', {
          screen: 'notifications',
          params: { screen: 'requests' },
        })
      }
      accessibilityLabel={intl.formatMessage(messages.pendingRequests, {
        notifications: policy.summary.pending_notifications_count,
        requests: policy.summary.pending_requests_count,
      })}
      badge={policy.summary.pending_requests_count}
    />
  );
};

const NotificationsMarkReadButton = () => {
  const intl = useIntl();

  const notificationCount = useNotificationsUnreadCount();
  const { mutate: markNotificationsRead } = useMarkNotificationsReadMutation();

  const { data: notifications = [] } = useNotifications([]);

  const handleClick = () => {
    markNotificationsRead(
      notifications[0]?.page_max_id ?? notifications[0]?.most_recent_notification_id,
    );
  };

  return (
    <HeaderIconButton
      icon={ChecksIcon}
      disabled={!notificationCount}
      onPress={handleClick}
      accessibilityLabel={intl.formatMessage(messages.markRead)}
    />
  );
};

interface INotificationsHeaderRight {
  routeName: 'all' | 'mentions';
}

const NotificationsHeaderRight: React.FC<INotificationsHeaderRight> = ({ routeName }) => {
  const intl = useIntl();

  const [showFiltersDialog, setShowFiltersDialog] = React.useState(false);

  return (
    <>
      {routeName !== 'mentions' && (
        <HeaderIconButton
          icon={FunnelIcon}
          onPress={() => setShowFiltersDialog(true)}
          accessibilityLabel={intl.formatMessage(messages.showFilters)}
        />
      )}
      <InteractionRequestsButton />
      <FollowRequestsButton />
      <FilteredNotificationsButton />
      <NotificationsMarkReadButton />
      <FiltersDialog visible={showFiltersDialog} setVisible={setShowFiltersDialog} />
    </>
  );
};

interface INotificationsList {
  tab: keyof NotificationsTabsParams;
}

const NotificationsList: React.FC<INotificationsList> = ({ tab }) => {
  const ref = React.useRef<FlashListRef<NotificationGroup>>(null);
  useScrollToTop(ref);

  const filters = useSetting('notifications.filters');
  const query = useNotifications(tab === 'all' ? filters : ['mention']);
  const { data: marker } = useNotificationsMarker();

  const autoloadMore = useSetting('timelines.autoloadMore');
  const { bottom: bottomInset } = useSafeAreaInsets();

  if (query.isPending) return <LoadingIndicator />;

  return (
    <FlashList
      ref={ref}
      data={query.data}
      renderItem={({ item }) => (
        <Notification
          notification={item}
          unread={marker && compareId(item.most_recent_notification_id, marker.last_read_id) > 0}
        />
      )}
      keyExtractor={(item) => item.most_recent_notification_id}
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

const AllNotifications = () => <NotificationsList tab='all' />;

const MentionNotifications = () => <NotificationsList tab='mentions' />;

const NotificationsTabs = createMaterialTopTabNavigator<NotificationsTabsParams>();

const NotificationsScreen = ({
  navigation,
}: NativeStackScreenProps<NotificationsStackParams, 'view'>) => {
  const intl = useIntl();
  const tabBarProps = useTabBarProps();
  const [currentTab, setCurrentTab] = React.useState(0);

  const filters = useSetting('notifications.filters');

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => <NotificationsHeaderRight routeName={currentTab ? 'mentions' : 'all'} />,
    });
  }, [navigation, currentTab]);

  return (
    <NotificationsTabs.Navigator onTabSelect={({ index }) => setCurrentTab(index)} {...tabBarProps}>
      <NotificationsTabs.Screen
        name='all'
        component={AllNotifications}
        options={{
          title: intl.formatMessage(filters.length ? messages.tabFiltered : messages.tabAll),
        }}
      />
      <NotificationsTabs.Screen
        name='mentions'
        component={MentionNotifications}
        options={{ title: intl.formatMessage(messages.tabMentions) }}
      />
    </NotificationsTabs.Navigator>
  );
};

const NotificationsStack = createNativeStackNavigator<NotificationsStackParams>();

const NotificationsStackScreen = () => {
  const intl = useIntl();

  return (
    <NotificationsStack.Navigator screenOptions={{ header: Header }}>
      <NotificationsStack.Screen
        name='view'
        component={NotificationsScreen}
        options={{
          header: (props) => <Header {...props} withBottomBorder={false} />,
          title: intl.formatMessage(messages.notificationsHeading),
        }}
      />
      <NotificationsStack.Screen
        name='requests'
        component={NotificationRequestsScreen}
        options={{ title: intl.formatMessage(messages.requestsHeading) }}
      />
      <NotificationsStack.Screen
        name='request'
        component={NotificationRequestScreen}
        options={{ title: intl.formatMessage(messages.requestHeading) }}
      />
    </NotificationsStack.Navigator>
  );
};

export { NotificationsStackScreen };
