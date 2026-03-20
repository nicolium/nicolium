import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { useSettings } from '@/stores/settings';

import { useFeatures } from './use-features';

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
  setAsDefault: {
    id: 'timeline_filters.set_as_default',
    defaultMessage: 'Set as default timeline',
  },
});

const defaultSettings = {
  showReblogs: true,
  showSelfReblogs: true,
  showReplies: true,
  showQuotes: true,
  showDirect: true,
  showNonMedia: true,
};

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
) => {
  const intl = useIntl();
  const features = useFeatures();
  const timelineSettings = useSettings().timelines[timeline] || defaultSettings;

  return useMemo(() => {
    const items: Menu = [];

    if (timeline === 'home') {
      items.push({
        text: intl.formatMessage(messages.showReblogs),
        type: 'toggle',
        checked: timelineSettings?.showReblogs,
        onChange: (checked) => changeSetting(['timelines', timeline, 'showReblogs'], checked),
      });
      items.push({
        text: intl.formatMessage(messages.showSelfReblogs),
        type: 'toggle',
        checked: timelineSettings?.showSelfReblogs,
        disabled: !timelineSettings?.showReblogs,
        onChange: (checked) => changeSetting(['timelines', timeline, 'showSelfReblogs'], checked),
      });
    }

    items.push({
      text: intl.formatMessage(messages.showReplies),
      type: 'toggle',
      checked: timelineSettings?.showReplies,
      onChange: (checked) => changeSetting(['timelines', timeline, 'showReplies'], checked),
    });

    if (features.quotePosts) {
      items.push({
        text: intl.formatMessage(messages.showQuotes),
        type: 'toggle',
        checked: timelineSettings?.showQuotes,
        onChange: (checked) => changeSetting(['timelines', timeline, 'showQuotes'], checked),
      });
    }

    if (timeline === 'home') {
      items.push({
        text: intl.formatMessage(messages.showDirect),
        type: 'toggle',
        checked: timelineSettings?.showDirect,
        onChange: (checked) => changeSetting(['timelines', timeline, 'showDirect'], checked),
      });
    }

    items.push({
      text: intl.formatMessage(messages.hideNonMedia),
      type: 'toggle',
      checked: !timelineSettings?.showNonMedia,
      onChange: (checked) => changeSetting(['timelines', timeline, 'showNonMedia'], !checked),
    });

    // {
    //   items.push(null);

    //   items.push({
    //     text: intl.formatMessage(messages.setAsDefault),
    //     icon: iconHouse,
    //   });
    // }

    return items;
  }, [timeline, features, timelineSettings]);
};

export { useTimelineFiltersOptions };
