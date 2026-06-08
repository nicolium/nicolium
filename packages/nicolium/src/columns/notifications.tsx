import iconAt from '@phosphor-icons/core/regular/at.svg';
import iconBellSimpleRinging from '@phosphor-icons/core/regular/bell-simple-ringing.svg';
import iconCalendarDots from '@phosphor-icons/core/regular/calendar-dots.svg';
import iconChartBar from '@phosphor-icons/core/regular/chart-bar.svg';
import iconRepeat from '@phosphor-icons/core/regular/repeat.svg';
import iconRocketLaunch from '@phosphor-icons/core/regular/rocket-launch.svg';
import iconStar from '@phosphor-icons/core/regular/star.svg';
import iconUserPlus from '@phosphor-icons/core/regular/user-plus.svg';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { saveSettings } from '@/actions/settings';
import Notification from '@/components/notification';
import PlaceholderNotification from '@/components/placeholders/placeholder-notification';
import PullToRefresh from '@/components/pull-to-refresh';
import ScrollTopButton from '@/components/scroll-top-button';
import ScrollableList from '@/components/scrollable-list';
import Icon from '@/components/ui/icon';
import Tabs from '@/components/ui/tabs';
import { useFeatures } from '@/hooks/use-features';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import {
  type FilterType,
  useMarkNotificationsReadMutation,
  useNotifications,
} from '@/queries/notifications/use-notifications';
import { useSettings, useSettingsStoreActions } from '@/stores/settings';
import { selectChild } from '@/utils/scroll-utils';

import type { Item } from '@/components/ui/tabs';
import type { VirtuosoHandle } from 'react-virtuoso';

import '@/styles/notifications.scss';

const messages = defineMessages({
  title: { id: 'column.notifications', defaultMessage: 'Notifications' },
  queue: {
    id: 'notifications.queue_label',
    defaultMessage:
      'Click to see {count} new {count, plural, one {notification} other {notifications}}',
  },
  queueLiveRegion: {
    id: 'notifications.queue_label.live_region',
    defaultMessage: '{count} new {count, plural, one {notification} other {notifications}}.',
  },
  all: { id: 'notifications.filter.all', defaultMessage: 'All' },
  mentions: { id: 'notifications.filter_mentions', defaultMessage: 'Mentions' },
  statuses: {
    id: 'notifications.filter.statuses',
    defaultMessage: 'Updates from people you follow',
  },
  favourites: { id: 'notifications.filter.favourites', defaultMessage: 'Likes' },
  boosts: { id: 'notifications.filter.boosts', defaultMessage: 'Reposts' },
  polls: { id: 'notifications.filter.polls', defaultMessage: 'Poll results' },
  events: { id: 'notifications.filter.events', defaultMessage: 'Events' },
  follows: { id: 'notifications.filter.follows', defaultMessage: 'Follows' },
});

interface IFilterBar {
  selected?: FilterType;
  onSelect?: (filter: FilterType) => void;
}

const FilterBar: React.FC<IFilterBar> = ({ selected, onSelect }) => {
  const intl = useIntl();
  const { notifications: notificationsSettings, useRocketIconForReblogs } = useSettings();
  const { changeSetting } = useSettingsStoreActions();
  const features = useFeatures();

  const selectedFilter = selected ?? notificationsSettings.quickFilter.active;
  const advancedMode = notificationsSettings.quickFilter.advanced;

  const onClick = (filterType: FilterType) => () => {
    if (onSelect) {
      onSelect(filterType);
    } else {
      changeSetting(['notifications', 'quickFilter', 'active'], filterType);
      saveSettings();
    }
    if (filterType === selectedFilter) {
      queryClient.refetchQueries({
        queryKey: queryKeys.notifications.list(filterType, notificationsSettings.hideBots),
        exact: true,
      });
    }
  };

  const items: Item[] = [
    {
      text: intl.formatMessage(messages.all),
      action: onClick('all'),
      name: 'all',
    },
  ];

  if (!advancedMode) {
    items.push({
      text: intl.formatMessage(messages.mentions),
      action: onClick('mention'),
      name: 'mention',
    });
  } else {
    items.push({
      text: <Icon src={iconAt} aria-hidden />,
      title: intl.formatMessage(messages.mentions),
      action: onClick('mention'),
      name: 'mention',
    });
    if (features.accountNotifies)
      items.push({
        text: <Icon src={iconBellSimpleRinging} aria-hidden />,
        title: intl.formatMessage(messages.statuses),
        action: onClick('status'),
        name: 'status',
      });
    items.push({
      text: <Icon src={iconStar} aria-hidden />,
      title: intl.formatMessage(messages.favourites),
      action: onClick('favourite'),
      name: 'favourite',
    });
    items.push({
      text: <Icon src={useRocketIconForReblogs ? iconRocketLaunch : iconRepeat} aria-hidden />,
      title: intl.formatMessage(messages.boosts),
      action: onClick('reblog'),
      name: 'reblog',
    });
    if (features.polls)
      items.push({
        text: <Icon src={iconChartBar} aria-hidden />,
        title: intl.formatMessage(messages.polls),
        action: onClick('poll'),
        name: 'poll',
      });
    if (features.events)
      items.push({
        text: <Icon src={iconCalendarDots} aria-hidden />,
        title: intl.formatMessage(messages.events),
        action: onClick('events'),
        name: 'events',
      });
    items.push({
      text: <Icon src={iconUserPlus} aria-hidden />,
      title: intl.formatMessage(messages.follows),
      action: onClick('follow'),
      name: 'follow',
    });
  }

  return <Tabs items={items} activeItem={selectedFilter} />;
};

interface INotificationsColumn {
  multiColumn?: boolean;
  compact?: boolean;
  filter?: FilterType;
  onChangeFilter?: (filter: FilterType) => void;
}

const NotificationsColumn: React.FC<INotificationsColumn> = ({
  multiColumn,
  compact,
  filter,
  onChangeFilter,
}) => {
  const features = useFeatures();
  const settings = useSettings();
  const { mutate: markNotificationsRead } = useMarkNotificationsReadMutation();
  const queryClient = useQueryClient();

  const showFilterBar =
    !compact &&
    (features.notificationsExcludeTypes || features.notificationsIncludeTypes) &&
    settings.notifications.quickFilter.show;
  const activeFilter = compact ? 'all' : (filter ?? settings.notifications.quickFilter.active);
  const {
    data: notifications = [],
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useNotifications(activeFilter);

  const [topNotification, setTopNotification] = useState<string>();
  const { queuedNotificationCount, displayedNotifications } = useMemo(() => {
    if (topNotification) {
      const cutoffIndex = notifications.findIndex(
        (notification) => notification.most_recent_notification_id <= topNotification,
      );

      if (cutoffIndex === -1) {
        return {
          queuedNotificationCount: 0,
          displayedNotifications: notifications,
        };
      }

      return {
        queuedNotificationCount: cutoffIndex,
        displayedNotifications: notifications.slice(cutoffIndex),
      };
    }

    return {
      queuedNotificationCount: 0,
      displayedNotifications: notifications,
    };
  }, [notifications, topNotification]);
  const hasMore = hasNextPage ?? false;

  const isFirstRender = useRef(true);
  const node = useRef<VirtuosoHandle | null>(null);
  const scrollableContentRef = useRef<Array<React.JSX.Element> | null>(null);

  const handleLoadOlder = useCallback(
    debounce(
      () => {
        if (!hasMore || isFetchingNextPage) return;

        fetchNextPage().catch((error) => {
          console.error(error);
        });
      },
      300,
      { leading: true },
    ),
    [fetchNextPage, hasMore, isFetchingNextPage],
  );

  const handleScrollToTop = useCallback(
    debounce(() => {
      const topNotificationId =
        displayedNotifications[0]?.page_max_id ??
        displayedNotifications[0]?.most_recent_notification_id;
      markNotificationsRead(topNotificationId);
    }, 100),
    [fetchNextPage, hasMore, isFetchingNextPage, displayedNotifications],
  );

  const handleMoveUp = (id: string) => {
    const elementIndex =
      displayedNotifications.findIndex((item) => item !== null && item.group_key === id) - 1;
    selectChild(elementIndex, node);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex =
      displayedNotifications.findIndex((item) => item !== null && item.group_key === id) + 1;
    selectChild(elementIndex, node, undefined, displayedNotifications.length);
  };

  const handleDequeueNotifications = useCallback(() => {
    setTopNotification(notifications[0]?.most_recent_notification_id);

    markNotificationsRead(notifications[0]?.most_recent_notification_id);
  }, [notifications, markNotificationsRead]);

  const handleRefresh = useCallback(() => {
    queryClient.resetQueries({
      queryKey: queryKeys.notifications.list(activeFilter, settings.notifications.hideBots),
    });
    refetch().catch(console.error);
  }, [refetch]);

  useEffect(() => {
    handleDequeueNotifications();

    return () => {
      handleLoadOlder.cancel?.();
      handleScrollToTop.cancel?.();
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setTopNotification(undefined);
  }, [activeFilter]);

  useEffect(() => {
    if (topNotification || displayedNotifications.length === 0) return;
    setTopNotification(displayedNotifications[0].most_recent_notification_id);
  }, [displayedNotifications, topNotification]);

  const emptyMessage =
    activeFilter === 'all' ? (
      <FormattedMessage
        id='empty_column.notifications'
        defaultMessage='You don’t have any notifications yet. Interact with others to start the conversation.'
      />
    ) : (
      <FormattedMessage
        id='empty_column.notifications_filtered'
        defaultMessage='You don’t have any notifications of this type yet.'
      />
    );

  let scrollableContent: Array<React.JSX.Element> | null = null;

  const filterBarContainer = showFilterBar ? (
    <FilterBar selected={filter} onSelect={onChangeFilter} />
  ) : null;

  if (isLoading && scrollableContentRef.current) {
    scrollableContent = scrollableContentRef.current;
  } else if (displayedNotifications.length > 0 || hasMore) {
    scrollableContent = displayedNotifications.map((item) => (
      <Notification
        key={item.group_key}
        notification={item}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        compact={compact}
      />
    ));
  } else {
    scrollableContent = null;
  }

  scrollableContentRef.current = scrollableContent;

  const scrollContainer = (
    <ScrollableList
      ref={node}
      scrollKey='notifications'
      isLoading={isFetching}
      showLoading={isLoading}
      hasMore={hasMore}
      emptyMessageText={emptyMessage}
      placeholderComponent={PlaceholderNotification}
      placeholderCount={20}
      onLoadMore={handleLoadOlder}
      onScrollToTop={handleScrollToTop}
      listClassName={clsx('status-list', { 'status-list--loading': isLoading })}
      useWindowScroll={!multiColumn}
    >
      {scrollableContent!}
    </ScrollableList>
  );

  return (
    <>
      <ScrollTopButton
        onClick={handleDequeueNotifications}
        count={queuedNotificationCount}
        message={messages.queue}
        liveRegionMessage={messages.queueLiveRegion}
      />

      {filterBarContainer}

      <PullToRefresh onRefresh={handleRefresh}>{scrollContainer}</PullToRefresh>
    </>
  );
};

export { NotificationsColumn as default };
