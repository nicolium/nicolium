import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createSelector } from 'reselect';

import '@/styles/new/notifications.scss';
import {
  type FilterType,
  expandNotifications,
  markReadNotifications,
  scrollTopNotifications,
  setFilter,
} from '@/actions/notifications';
import PullToRefresh from '@/components/pull-to-refresh';
import ScrollTopButton from '@/components/scroll-top-button';
import ScrollableList from '@/components/scrollable-list';
import Icon from '@/components/ui/icon';
import Portal from '@/components/ui/portal';
import Tabs from '@/components/ui/tabs';
import Notification from '@/features/notifications/components/notification';
import PlaceholderNotification from '@/features/placeholder/components/placeholder-notification';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useFeatures } from '@/hooks/use-features';
import { useSettings } from '@/stores/settings';
import { selectChild } from '@/utils/scroll-utils';

import type { Item } from '@/components/ui/tabs';
import type { RootState } from '@/store';
import type { VirtuosoHandle } from 'react-virtuoso';

const messages = defineMessages({
  title: { id: 'column.notifications', defaultMessage: 'Notifications' },
  queue: {
    id: 'notifications.queue_label',
    defaultMessage:
      'Click to see {count} new {count, plural, one {notification} other {notifications}}',
  },
  all: { id: 'notifications.filter.all', defaultMessage: 'All' },
  mentions: { id: 'notifications.filter.mentions', defaultMessage: 'Mentions' },
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

const FilterBar = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const settings = useSettings();
  const features = useFeatures();

  const selectedFilter = settings.notifications.quickFilter.active;
  const advancedMode = settings.notifications.quickFilter.advanced;

  const onClick = (notificationType: FilterType) => () => {
    try {
      dispatch(setFilter(notificationType, true));
    } catch (e) {
      console.error(e);
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
      text: <Icon className='size-4' src={require('@phosphor-icons/core/regular/at.svg')} />,
      title: intl.formatMessage(messages.mentions),
      action: onClick('mention'),
      name: 'mention',
    });
    if (features.accountNotifies)
      items.push({
        text: (
          <Icon
            className='size-4'
            src={require('@phosphor-icons/core/regular/bell-simple-ringing.svg')}
          />
        ),
        title: intl.formatMessage(messages.statuses),
        action: onClick('status'),
        name: 'status',
      });
    items.push({
      text: <Icon className='size-4' src={require('@phosphor-icons/core/regular/star.svg')} />,
      title: intl.formatMessage(messages.favourites),
      action: onClick('favourite'),
      name: 'favourite',
    });
    items.push({
      text: <Icon className='size-4' src={require('@phosphor-icons/core/regular/repeat.svg')} />,
      title: intl.formatMessage(messages.boosts),
      action: onClick('reblog'),
      name: 'reblog',
    });
    if (features.polls)
      items.push({
        text: (
          <Icon className='size-4' src={require('@phosphor-icons/core/regular/chart-bar.svg')} />
        ),
        title: intl.formatMessage(messages.polls),
        action: onClick('poll'),
        name: 'poll',
      });
    if (features.events)
      items.push({
        text: (
          <Icon
            className='size-4'
            src={require('@phosphor-icons/core/regular/calendar-dots.svg')}
          />
        ),
        title: intl.formatMessage(messages.events),
        action: onClick('events'),
        name: 'events',
      });
    items.push({
      text: <Icon className='size-4' src={require('@phosphor-icons/core/regular/user-plus.svg')} />,
      title: intl.formatMessage(messages.follows),
      action: onClick('follow'),
      name: 'follow',
    });
  }

  return <Tabs items={items} activeItem={selectedFilter} />;
};

const getNotifications = createSelector(
  [
    (state: RootState) => state.notifications.items,
    (_, topNotification?: string) => topNotification,
  ],
  (notifications, topNotificationId) => {
    if (topNotificationId) {
      const queuedNotificationCount = notifications.findIndex(
        (notification) => notification.most_recent_notification_id <= topNotificationId,
      );
      const displayedNotifications = notifications.slice(queuedNotificationCount);

      return {
        queuedNotificationCount,
        displayedNotifications,
      };
    }

    return {
      queuedNotificationCount: 0,
      displayedNotifications: notifications,
    };
  },
);

interface INotificationsColumn {
  multiColumn?: boolean;
}

const NotificationsColumn: React.FC<INotificationsColumn> = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const settings = useSettings();

  const showFilterBar =
    (features.notificationsExcludeTypes || features.notificationsIncludeTypes) &&
    settings.notifications.quickFilter.show;
  const activeFilter = settings.notifications.quickFilter.active;
  const [topNotification, setTopNotification] = useState<string>();
  const { queuedNotificationCount, displayedNotifications } = useAppSelector((state) =>
    getNotifications(state, topNotification),
  );
  const isLoading = useAppSelector((state) => state.notifications.isLoading);
  // const isUnread = useAppSelector(state => state.notifications.unread > 0);
  const hasMore = useAppSelector((state) => state.notifications.hasMore);

  const node = useRef<VirtuosoHandle>(null);
  const scrollableContentRef = useRef<Array<JSX.Element> | null>(null);

  // const handleLoadGap = (maxId) => {
  //   dispatch(expandNotifications({ maxId }));
  // };

  const handleLoadOlder = useCallback(
    debounce(
      () => {
        const minId = displayedNotifications.reduce<string | undefined>(
          (minId, notification) =>
            minId && notification.page_min_id && notification.page_min_id > minId
              ? minId
              : notification.page_min_id,
          undefined,
        );
        dispatch(expandNotifications({ maxId: minId }));
      },
      300,
      { leading: true },
    ),
    [displayedNotifications],
  );

  const handleScrollToTop = useCallback(
    debounce(() => {
      dispatch(scrollTopNotifications(true));
    }, 100),
    [],
  );

  const handleScroll = useCallback(
    debounce(() => {
      dispatch(scrollTopNotifications(false));
    }, 100),
    [],
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
    setTopNotification(undefined);
    dispatch(markReadNotifications());
  }, []);

  const handleRefresh = useCallback(() => dispatch(expandNotifications()), []);

  useEffect(() => {
    handleDequeueNotifications();
    dispatch(scrollTopNotifications(true));

    return () => {
      handleLoadOlder.cancel?.();
      handleScrollToTop.cancel();
      handleScroll.cancel?.();
      dispatch(scrollTopNotifications(false));
    };
  }, []);

  useEffect(() => {
    if (topNotification || displayedNotifications.length === 0) return;
    setTopNotification(displayedNotifications[0].most_recent_notification_id);
  }, [displayedNotifications.length]);

  const emptyMessage =
    activeFilter === 'all' ? (
      <FormattedMessage
        id='empty_column.notifications'
        defaultMessage="You don't have any notifications yet. Interact with others to start the conversation."
      />
    ) : (
      <FormattedMessage
        id='empty_column.notifications_filtered'
        defaultMessage="You don't have any notifications of this type yet."
      />
    );

  let scrollableContent: Array<JSX.Element> | null = null;

  const filterBarContainer = showFilterBar ? <FilterBar /> : null;

  if (isLoading && scrollableContentRef.current) {
    scrollableContent = scrollableContentRef.current;
  } else if (displayedNotifications.length > 0 || hasMore) {
    scrollableContent = displayedNotifications.map((item) => (
      <Notification
        key={item.group_key}
        notification={item}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
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
      isLoading={isLoading}
      showLoading={isLoading && displayedNotifications.length === 0}
      hasMore={hasMore}
      emptyMessageText={emptyMessage}
      placeholderComponent={PlaceholderNotification}
      placeholderCount={20}
      onLoadMore={handleLoadOlder}
      onScrollToTop={handleScrollToTop}
      onScroll={handleScroll}
      listClassName={clsx('⁂-status-list', {
        'animate-pulse': displayedNotifications.length === 0,
      })}
      useWindowScroll={!multiColumn}
    >
      {scrollableContent!}
    </ScrollableList>
  );

  return (
    <>
      {filterBarContainer}

      <Portal>
        <ScrollTopButton
          onClick={handleDequeueNotifications}
          count={queuedNotificationCount}
          message={messages.queue}
        />
      </Portal>

      <PullToRefresh onRefresh={handleRefresh}>{scrollContainer}</PullToRefresh>
    </>
  );
};

export { NotificationsColumn as default };
