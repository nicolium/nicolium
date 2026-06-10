import iconBellSimple from '@phosphor-icons/core/regular/bell-simple.svg';
import iconBookmarks from '@phosphor-icons/core/regular/bookmarks.svg';
import iconBroadcast from '@phosphor-icons/core/regular/broadcast.svg';
import iconChartLine from '@phosphor-icons/core/regular/chart-line.svg';
import iconCirclesThree from '@phosphor-icons/core/regular/circles-three.svg';
import iconFediverseLogo from '@phosphor-icons/core/regular/fediverse-logo.svg';
import iconFolderSimple from '@phosphor-icons/core/regular/folder-simple.svg';
import iconGlobeSimple from '@phosphor-icons/core/regular/globe-simple.svg';
import iconGraph from '@phosphor-icons/core/regular/graph.svg';
import iconHash from '@phosphor-icons/core/regular/hash.svg';
import iconHouse from '@phosphor-icons/core/regular/house.svg';
import iconLink from '@phosphor-icons/core/regular/link.svg';
import iconListDashes from '@phosphor-icons/core/regular/list-dashes.svg';
import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconPlanet from '@phosphor-icons/core/regular/planet.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconUser from '@phosphor-icons/core/regular/user.svg';
import iconWrench from '@phosphor-icons/core/regular/wrench.svg';
import iconTimeline from 'lucide-static/icons/timeline.svg';
import React, { useMemo } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useAntennas } from '@/queries/accounts/use-antennas';
import { useCircles } from '@/queries/accounts/use-circles';
import { useLists } from '@/queries/accounts/use-lists';
import { useBookmarkFolders } from '@/queries/statuses/use-bookmark-folders';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';

import type { DeckColumn } from '@/schemas/frontend-settings';

const messages = defineMessages({
  homeTimeline: { id: 'column.home', defaultMessage: 'Home' },
  localTimeline: { id: 'column.community', defaultMessage: 'Local timeline' },
  bubbleTimeline: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
  federatedTimeline: { id: 'column.public', defaultMessage: 'Fediverse timeline' },
  wrenchedTimeline: { id: 'column.wrenched', defaultMessage: 'Recent wrenches timeline' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  circles: { id: 'column.circles', defaultMessage: 'Circles' },
  antennas: { id: 'column.antennas', defaultMessage: 'Antennas' },
  pinnedInstances: { id: 'timeline_picker.pinned_instances', defaultMessage: 'Pinned instances' },
  timelines: { id: 'deck.columns.timelines', defaultMessage: 'Timelines' },
  notifications: { id: 'column.notifications', defaultMessage: 'Notifications' },
  search: { id: 'column.search', defaultMessage: 'Search' },
  trending: { id: 'deck.columns.trending', defaultMessage: 'Trending' },
  trendingAccounts: { id: 'deck.columns.trending_accounts', defaultMessage: 'Trending accounts' },
  trendingStatuses: { id: 'deck.columns.trending_statuses', defaultMessage: 'Trending statuses' },
  trendingHashtags: { id: 'deck.columns.trending_hashtags', defaultMessage: 'Trending hashtags' },
  trendingLinks: { id: 'deck.columns.trending_links', defaultMessage: 'Trending links' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  allBookmarks: { id: 'column.bookmarks.all', defaultMessage: 'All bookmarks' },
});

const NewColumnButton = () => {
  const intl = useIntl();
  const features = useFeatures();
  const { data: account } = useOwnAccount();
  const isAdmin = account!.is_admin || account?.is_moderator;
  const timelineAccess = useInstance().configuration.timelines_access;
  const {
    defaultTimeline,
    remote_timeline: { pinnedHosts },
    deck,
  } = useSettings();

  const { data: lists } = useLists();
  const { data: circles } = useCircles();
  const { data: antennas } = useAntennas();
  const { data: bookmarkFolders } = useBookmarkFolders();

  const handleAdd = (blueprint: Partial<DeckColumn>) => () => {
    const newColumn: Partial<DeckColumn> = {
      id: crypto.randomUUID(),
      columnWidth: 'md',
      ...blueprint,
    };
    changeSetting(['deck', 'columns'], [...deck.columns, newColumn]);
  };

  const items = useMemo(() => {
    const items: Menu = [];

    const timelines: Menu = [
      {
        text: intl.formatMessage(messages.homeTimeline),
        icon: iconHouse,
        action: handleAdd({ type: 'timeline', timeline: 'home' }),
      },
    ];

    if (
      features.publicTimeline &&
      (timelineAccess.live_feeds.local === 'restricted'
        ? isAdmin
        : timelineAccess.live_feeds.local === 'public')
    ) {
      timelines.push({
        text: intl.formatMessage(messages.localTimeline),
        icon: iconPlanet,
        action: handleAdd({ type: 'timeline', timeline: 'local' }),
      });
    }

    if (
      features.bubbleTimeline &&
      (timelineAccess.live_feeds.bubble === 'restricted'
        ? isAdmin
        : timelineAccess.live_feeds.bubble === 'public')
    ) {
      timelines.push({
        text: intl.formatMessage(messages.bubbleTimeline),
        icon: iconGraph,
        action: handleAdd({ type: 'timeline', timeline: 'bubble' }),
      });
    }
    if (
      features.publicTimeline &&
      (timelineAccess.live_feeds.remote === 'restricted'
        ? isAdmin
        : timelineAccess.live_feeds.remote === 'public')
    ) {
      timelines.push({
        text: intl.formatMessage(messages.federatedTimeline),
        icon: iconFediverseLogo,
        action: handleAdd({ type: 'timeline', timeline: 'federated' }),
      });
    }
    if (
      features.wrenchedTimeline &&
      (timelineAccess.live_feeds.wrenched === 'restricted'
        ? isAdmin
        : timelineAccess.live_feeds.wrenched === 'public')
    ) {
      timelines.push({
        text: intl.formatMessage(messages.wrenchedTimeline),
        icon: iconWrench,
        action: handleAdd({ type: 'timeline', timeline: 'wrenched' }),
      });
    }

    items.push({
      text: intl.formatMessage(messages.timelines),
      icon: iconTimeline,
      items: timelines,
    });

    if (lists?.length) {
      items.push({
        text: intl.formatMessage(messages.lists),
        icon: iconListDashes,
        items: lists.map((list) => ({
          text: list.title,
          icon: iconListDashes,
          action: handleAdd({ type: 'timeline', timeline: `list:${list.id}` }),
        })),
      });
    }
    if (circles?.length) {
      items.push({
        text: intl.formatMessage(messages.circles),
        icon: iconCirclesThree,
        items: circles.map((circle) => ({
          text: circle.title,
          icon: iconListDashes,
          action: handleAdd({ type: 'timeline', timeline: `circle:${circle.id}` }),
        })),
      });
    }
    if (antennas?.length) {
      items.push({
        text: intl.formatMessage(messages.antennas),
        icon: iconBroadcast,
        items: antennas.map((antenna) => ({
          text: antenna.title,
          icon: iconListDashes,
          action: handleAdd({ type: 'timeline', timeline: `antenna:${antenna.id}` }),
        })),
      });
    }
    if (pinnedHosts.length) {
      items.push({
        text: intl.formatMessage(messages.pinnedInstances),
        icon: iconGlobeSimple,
        items: pinnedHosts.map((instance) => ({
          params: { instance },
          text: instance,
          icon: iconGlobeSimple,
          action: handleAdd({ type: 'timeline', timeline: `instance:${instance}` }),
        })),
      });
    }

    if (features.bookmarks) {
      if (bookmarkFolders?.length) {
        items.push({
          text: intl.formatMessage(messages.bookmarks),
          icon: iconBookmarks,
          items: [
            {
              text: intl.formatMessage(messages.allBookmarks),
              icon: iconBookmarks,
              action: handleAdd({ type: 'bookmarks' }),
            },
            ...bookmarkFolders.map((folder) => ({
              text: folder.name,
              icon: iconFolderSimple,
              action: handleAdd({ type: 'bookmarks' as const, folderId: folder.id }),
            })),
          ],
        });
      } else {
        items.push({
          text: intl.formatMessage(messages.bookmarks),
          icon: iconBookmarks,
          action: handleAdd({ type: 'bookmarks' }),
        });
      }
    }

    items.push({
      text: intl.formatMessage(messages.notifications),
      icon: iconBellSimple,
      action: handleAdd({ type: 'notifications' }),
    });

    items.push({
      text: intl.formatMessage(messages.search),
      icon: iconMagnifyingGlass,
      action: handleAdd({ type: 'search' }),
    });

    const trends: Menu = [];

    if (features.suggestions || features.suggestionsV2) {
      trends.push({
        text: intl.formatMessage(messages.trendingAccounts),
        icon: iconUser,
        action: handleAdd({ type: 'trending', trendsType: 'accounts' }),
      });
    }

    if (features.trendingStatuses) {
      trends.push({
        text: intl.formatMessage(messages.trendingStatuses),
        icon: iconTimeline,
        action: handleAdd({ type: 'trending', trendsType: 'statuses' }),
      });
    }

    if (features.trends) {
      trends.push({
        text: intl.formatMessage(messages.trendingHashtags),
        icon: iconHash,
        action: handleAdd({ type: 'trending', trendsType: 'hashtags' }),
      });
    }

    if (features.trendingLinks) {
      trends.push({
        text: intl.formatMessage(messages.trendingLinks),
        icon: iconLink,
        action: handleAdd({ type: 'trending', trendsType: 'links' }),
      });
    }

    if (trends.length > 1) {
      items.push({
        text: intl.formatMessage(messages.trending),
        icon: iconChartLine,
        items: trends,
      });
    } else if (trends.length === 1) {
      items.push(trends[0]);
    }

    return items;
  }, [lists, circles, antennas, bookmarkFolders, features, defaultTimeline, isAdmin, deck.columns]);

  return (
    <DropdownMenu items={items} width='16rem'>
      <button id='add-column' className='deck__add-column-button'>
        <Icon src={iconPlus} aria-hidden />
        <FormattedMessage id='column.deck.add' defaultMessage='Add column' />
      </button>
    </DropdownMenu>
  );
};

export { NewColumnButton };
