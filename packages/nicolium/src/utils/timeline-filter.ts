import { compareId } from '@/utils/comparators';

import type { TimelineFilters } from '@/schemas/frontend-settings';
import type { TimelineEntry, StatusEntry } from '@/stores/timelines';

const isEntryFiltered = (entry: StatusEntry, filters: TimelineFilters): boolean =>
  (filters?.showDirect === false && entry.isDirect) ||
  (filters?.showReblogs === false && entry.isReblog) ||
  (filters?.showSelfReblogs === false &&
    entry.isReblog &&
    entry.rebloggedBy.length === 1 &&
    entry.rebloggedBy[0] === entry.accountId) ||
  (filters?.showReplies === false && entry.isReply) ||
  (filters?.showQuotes === false && entry.isQuote) ||
  (filters?.showNonMedia === false && !entry.hasMedia) ||
  (filters?.showMediaWithoutAltText === false && entry.hasMediaWithoutAltText);

const hasActiveFilters = (filters: TimelineFilters | undefined): filters is TimelineFilters =>
  !!filters &&
  (filters.showDirect === false ||
    filters.showReblogs === false ||
    filters.showReplies === false ||
    filters.showQuotes === false ||
    filters.showNonMedia === false ||
    filters.showMediaWithoutAltText === false);

const sortFilteredTimeline = (
  entries: Array<TimelineEntry>,
  filters: TimelineFilters,
): Array<TimelineEntry> => {
  const result: Array<TimelineEntry> = [];
  let collectedGroups: Array<{ sortKey: string; entries: Array<StatusEntry> }> = [];
  let currentGroup: Array<StatusEntry> = [];

  const endGroup = () => {
    if (currentGroup.length === 0) return;

    let sortKey = currentGroup[0].originalId;
    for (let i = 1; i < currentGroup.length; i++) {
      if (compareId(currentGroup[i].originalId, sortKey) > 0) {
        sortKey = currentGroup[i].originalId;
      }
    }

    collectedGroups.push({ sortKey, entries: currentGroup });
    currentGroup = [];
  };

  const endSection = () => {
    endGroup();

    if (collectedGroups.length > 1) {
      collectedGroups.sort((a, b) => compareId(b.sortKey, a.sortKey));
    }

    for (const group of collectedGroups) {
      for (const entry of group.entries) {
        result.push(entry);
      }
    }
    collectedGroups = [];
  };

  for (const entry of entries) {
    if (entry.type === 'status' && isEntryFiltered(entry, filters)) continue;

    if (entry.type !== 'status') {
      endSection();
      result.push(entry);
      continue;
    }

    if (entry.isConnectedTop && currentGroup.length > 0) {
      currentGroup.push(entry);
    } else {
      endGroup();
      currentGroup = [entry];
    }
  }

  endSection();

  return result;
};

export { sortFilteredTimeline, hasActiveFilters, isEntryFiltered };
