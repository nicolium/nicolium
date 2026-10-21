import type { TimelineFilters } from '@/stores/settings';

const defaultSettings: TimelineFilters = {
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
  key: Exclude<keyof typeof defaultSettings, 'hideFollowedReposts'>,
  value: boolean,
): typeof defaultSettings => ({
  ...timeline,
  [key]: value,
});

export { getUpdatedTimelineSettings, defaultSettings as defaultFiltersSettings };
