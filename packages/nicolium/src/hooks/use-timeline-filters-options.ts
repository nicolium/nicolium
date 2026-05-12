import iconHouse from '@phosphor-icons/core/regular/house.svg';
import iconList from '@phosphor-icons/core/regular/list.svg';
import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';

import { useFeatures } from './use-features';
import { useLoggedIn } from './use-logged-in';

import type { Menu } from '@/components/dropdown-menu';

const messages = defineMessages({
  showReblogs: { id: 'timeline_filters.show_reblogs', defaultMessage: 'Show reposts' },
  showSelfReblogs: {
    id: 'timeline_filters.show_self_reblogs',
    defaultMessage: 'Show self-reposts',
  },
  showReplies: { id: 'timeline_filters.show_replies', defaultMessage: 'Show replies' },
  showQuotes: { id: 'timeline_filters.show_quotes', defaultMessage: 'Show quotes' },
  showDirect: {
    id: 'timeline_filters.show_direct',
    defaultMessage: 'Show direct messages',
  },
  hideNonMedia: {
    id: 'timeline_filters.show_media_only',
    defaultMessage: 'Only show posts with media',
  },
  showMediaWithoutAltText: {
    id: 'timeline_filters.show_media_without_alt_text',
    defaultMessage: 'Show media without description',
  },
  setAsDefault: {
    id: 'timeline_filters.set_as_default',
    defaultMessage: 'Use as default timeline',
  },
  includeInNavigationItems: {
    id: 'timeline_filters.include_in_navigation_items',
    defaultMessage: 'Include in navigation items',
  },
  addToNavigationItemsSuccess: {
    id: 'account.add_to_navigation_items.success',
    defaultMessage: 'Added to navigation items',
  },
  removeFromNavigationItemsSuccess: {
    id: 'account.remove_from_navigation_items.success',
    defaultMessage: 'Removed from navigation items',
  },
  view: { id: 'toast.view', defaultMessage: 'View' },
});

const defaultSettings = {
  showReblogs: true,
  showSelfReblogs: true,
  showReplies: true,
  showQuotes: true,
  showDirect: true,
  showNonMedia: true,
  showMediaWithoutAltText: true,
};

const getUpdatedTimelineSettings = (
  timeline: typeof defaultSettings,
  key: keyof typeof defaultSettings,
  value: boolean,
): typeof defaultSettings => ({
  ...timeline,
  [key]: value,
});

const useTimelineFiltersOptions = (
  timeline:
    | 'home'
    | 'antenna'
    | 'bubble'
    | 'circle'
    | 'local'
    | 'group'
    | 'hashtag'
    | 'list'
    | 'public'
    | 'wrenched',
  timelineId?: string,
) => {
  const intl = useIntl();
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();
  const { timelines, defaultTimeline, navigationItems, pinnedNavigationItems } = useSettings();
  const timelineSettings = timelines[timeline] || defaultSettings;

  return useMemo(() => {
    const items: Menu = [];

    const handleOnChecked =
      (key: keyof typeof defaultSettings, inverse: boolean = false) =>
      (checked: boolean) =>
        changeSetting(
          ['timelines', timeline],
          getUpdatedTimelineSettings(timelineSettings, key, inverse ? !checked : checked),
        );

    if (['home', 'list', 'antenna'].includes(timeline)) {
      items.push({
        text: intl.formatMessage(messages.showReblogs),
        type: 'toggle',
        checked: timelineSettings?.showReblogs,
        onChange: handleOnChecked('showReblogs'),
      });
      items.push({
        text: intl.formatMessage(messages.showSelfReblogs),
        type: 'toggle',
        checked: timelineSettings?.showSelfReblogs,
        disabled: !timelineSettings?.showReblogs,
        onChange: handleOnChecked('showSelfReblogs'),
      });
    }

    items.push({
      text: intl.formatMessage(messages.showReplies),
      type: 'toggle',
      checked: timelineSettings?.showReplies,
      onChange: handleOnChecked('showReplies'),
    });

    if (features.quotePosts) {
      items.push({
        text: intl.formatMessage(messages.showQuotes),
        type: 'toggle',
        checked: timelineSettings?.showQuotes,
        onChange: handleOnChecked('showQuotes'),
      });
    }

    if (timeline === 'home') {
      items.push({
        text: intl.formatMessage(messages.showDirect),
        type: 'toggle',
        checked: timelineSettings?.showDirect,
        onChange: handleOnChecked('showDirect'),
      });
    }

    items.push({
      text: intl.formatMessage(messages.hideNonMedia),
      type: 'toggle',
      checked: !timelineSettings?.showNonMedia,
      onChange: handleOnChecked('showNonMedia', true),
    });

    items.push({
      text: intl.formatMessage(messages.showMediaWithoutAltText),
      type: 'toggle',
      checked: timelineSettings?.showMediaWithoutAltText,
      onChange: handleOnChecked('showMediaWithoutAltText'),
    });

    if (timelineId && isLoggedIn) {
      items.push(null);

      items.push({
        text: intl.formatMessage(messages.setAsDefault),
        icon: iconHouse,
        type: 'toggle',
        checked: defaultTimeline === timelineId,
        disabled: defaultTimeline === timelineId && timelineId === 'home',
        onChange: () => changeSetting(['defaultTimeline'], timelineId),
      });
    }

    if (['antenna', 'circle', 'group', 'hashtag', 'list'].includes(timeline) && timelineId) {
      const navigationItemId = timelineId as any;
      const isAdded = navigationItems.includes(navigationItemId);

      items.push({
        text: intl.formatMessage(messages.includeInNavigationItems),
        icon: iconList,
        type: 'toggle',
        checked: isAdded,
        onChange: (value) => {
          if (value) {
            changeSetting(['navigationItems'], [...navigationItems, navigationItemId]);
            toast.success(intl.formatMessage(messages.addToNavigationItemsSuccess));
          } else {
            changeSetting(
              ['navigationItems'],
              navigationItems.filter((id) => id !== navigationItemId),
            );
            changeSetting(
              ['pinnedNavigationItems'],
              pinnedNavigationItems.filter((id) => id !== navigationItemId),
            );
            toast.success(intl.formatMessage(messages.removeFromNavigationItemsSuccess));
          }
        },
      });
    }

    return items;
  }, [timeline, features, timelineSettings, defaultTimeline, timelineId, navigationItems]);
};

export { useTimelineFiltersOptions, getUpdatedTimelineSettings };
