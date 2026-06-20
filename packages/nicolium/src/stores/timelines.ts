import { useMemo } from 'react';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { findStatuses } from '@/queries/statuses/use-status';
import { hasActiveFilters, isEntryFiltered } from '@/utils/timeline-filter';

import type { NormalizedStatus } from '@/queries/statuses/normalize';
import type { TimelineFilters } from '@/schemas/frontend-settings';
import type { CreateStatusParams, Status } from 'pl-api';

interface StatusEntry {
  type: 'status';
  id: string;
  // id of the topmost status where the target status was found, either the status itself or its reblog
  originalId: string;
  accountId: string;
  rebloggedBy: Array<string>;
  reblogIds: Array<string>;
  reblogVisibility?: string;
  isConnectedTop?: boolean;
  isConnectedBottom?: boolean;
  isReply: boolean;
  // this actually indicates whether the status exclusively appeared as a reblog on the processed page
  isReblog: boolean;
  isQuote: boolean;
  isDirect: boolean;
  hasMedia: boolean;
  hasMediaWithoutAltText: boolean;
}

type TimelineEntry =
  | StatusEntry
  | {
      type: 'pending-status';
      id: string;
    }
  | {
      type: 'gap';
      maxId?: string;
      maxIdDate?: string;
      minId: string;
      minDate: string;
    };

interface TimelineData {
  entries: Array<TimelineEntry>;
  queuedEntries: Array<Status>;
  queuedCount: number;
  queuedAccountIds: Array<string>;
  isFetching: boolean;
  isPending: boolean;
  isError: boolean | number;
  hasNextPage: boolean;
  oldestStatusId?: string;
  newestStatusId?: string;
}

interface State {
  timelines: Record<string, TimelineData>;
  pollingEnabled: boolean;
  actions: {
    expandTimeline: (
      timelineId: string,
      statuses: Array<Status>,
      hasMore?: boolean,
      initialFetch?: boolean,
      restoring?: boolean,
    ) => void;
    receiveStreamingStatus: (timelineId: string, status: Status) => void;
    deleteStatus: (statusId: string) => void;
    setLoading: (timelineId: string, isFetching: boolean) => void;
    setError: (timelineId: string, isError: boolean, statusCode?: number) => void;
    dequeueEntries: (timelineId: string) => void;
    fillGap: (
      timelineId: string,
      gapMinId: string,
      statuses: Array<Status>,
      hasMore: boolean,
      direction: 'up' | 'down',
    ) => void;
    importPendingStatus: (params: CreateStatusParams, idempotencyKey: string) => void;
    replacePendingStatus: (idempotencyKey: string, status: Status) => void;
    deletePendingStatus: (idempotencyKey: string) => void;
    filterTimelines: (accountId: string) => void;
    resetTimeline: (timelineId: string) => void;
    disablePolling: () => void;
    resetErroredTimelines: () => void;
  };
}

const hasMediaWithoutAltText = (status: Status): boolean =>
  status.media_attachments.some((media) => media.type !== 'unknown' && !media.description);

const processPage = (statuses: Array<Status>): Array<TimelineEntry> => {
  const timelinePage: Array<TimelineEntry> = [];

  const processStatus = (status: Status) => {
    const existingEntry = timelinePage.findIndex(
      (entry) => entry.type === 'status' && entry.id === (status.reblog || status).id,
    );

    if (existingEntry !== -1) {
      if (!status.reblog) {
        const entry = timelinePage[existingEntry];
        if (entry.type === 'status') entry.isReblog = false;
      }

      return existingEntry;
    }

    let isConnectedTop = false;
    const inReplyToId = (status.reblog || status).in_reply_to_id;

    if (inReplyToId) {
      const foundStatus = statuses.find((s) => (s.reblog || s).id === inReplyToId);

      if (foundStatus) {
        const entryIndex = processStatus(foundStatus);
        if (entryIndex === -1) {
          const lastEntry = timelinePage.at(-1);
          // it's always of type status but doing this to satisfy ts
          if (lastEntry?.type === 'status') lastEntry.isConnectedBottom = true;
          isConnectedTop = true;
        }
      }
    }

    if (status.reblog) {
      const existingEntry = timelinePage.find(
        (entry) => entry.type === 'status' && entry.id === status.reblog!.id,
      );

      if (existingEntry?.type === 'status') {
        // entry connection stuff might happen to call processStatus on the same status multiple times
        if (!existingEntry.rebloggedBy.includes(status.account.id)) {
          existingEntry.rebloggedBy.push(status.account.id);
          existingEntry.reblogIds.push(status.id);
          if (existingEntry.reblogVisibility !== status.visibility) {
            existingEntry.reblogVisibility = undefined;
          }
        }
      } else {
        timelinePage.push({
          type: 'status',
          id: status.reblog.id,
          originalId: status.id,
          accountId: status.reblog.account.id,
          rebloggedBy: [status.account.id],
          reblogIds: [status.id],
          reblogVisibility: status.visibility,
          isConnectedTop,
          isReply: status.reblog.in_reply_to_id !== null,
          isReblog: true,
          isQuote: status.reblog.quote !== null,
          isDirect: status.reblog.visibility === 'direct',
          hasMedia: status.reblog.media_attachments.length > 0,
          hasMediaWithoutAltText: hasMediaWithoutAltText(status.reblog),
        });
      }
      return -1;
    }

    timelinePage.push({
      type: 'status',
      id: status.id,
      originalId: status.id,
      accountId: status.account.id,
      rebloggedBy: [],
      reblogIds: [],
      isConnectedTop,
      isReply: status.in_reply_to_id !== null,
      isReblog: false,
      isQuote: status.quote !== null,
      isDirect: status.visibility === 'direct',
      hasMedia: status.media_attachments.length > 0,
      hasMediaWithoutAltText: hasMediaWithoutAltText(status),
    });

    return -1;
  };

  for (const status of statuses) {
    processStatus(status);
  }

  return timelinePage;
};

const getTimelinesForStatus = (
  status: Pick<Status, 'visibility' | 'group'> | Pick<CreateStatusParams, 'visibility'>,
): Array<string> => {
  switch (status.visibility) {
    case 'group':
      return [`group:${'group' in status && status.group?.id}`];
    case 'direct':
      return [];
    case 'public':
      return ['home', 'public:local', 'public', 'bubble'];
    default:
      return ['home'];
  }
};

const useTimelinesStore = create<State>()(
  mutative((set) => ({
    timelines: {} as Record<string, TimelineData>,
    pollingEnabled: true,
    actions: {
      expandTimeline: (timelineId, statuses, hasMore, initialFetch = false, restoring = false) =>
        set((state) => {
          const timeline = state.timelines[timelineId] ?? createEmptyTimeline();
          const entries = processPage(statuses);

          if (initialFetch) timeline.entries = entries;
          else timeline.entries.push(...entries);
          if (restoring) {
            timeline.entries.unshift({
              type: 'gap',
              minId: statuses[0].id,
              minDate: statuses[0].created_at,
            });
          }
          timeline.isPending = false;
          timeline.isFetching = false;
          if ((initialFetch || restoring) && statuses.length > 0) {
            timeline.newestStatusId = statuses[0].id;
          }
          if (typeof hasMore === 'boolean') {
            timeline.hasNextPage = hasMore;
            const oldestStatus = statuses.at(-1);
            if (oldestStatus) timeline.oldestStatusId = oldestStatus.id;
          }
          state.timelines[timelineId] = timeline;
        }),
      receiveStreamingStatus: (timelineId, status) => {
        set((state) => {
          const timeline = state.timelines[timelineId];
          if (!timeline) return;

          if (
            timeline.entries.some((entry) => entry.type === 'status' && entry.id === status.id) ||
            timeline.queuedEntries.some((s) => s.id === status.id)
          )
            return;

          if (!timeline.newestStatusId || timeline.newestStatusId.localeCompare(status.id) < 0) {
            timeline.newestStatusId = status.id;
          }
          timeline.queuedEntries.unshift(status);
          timeline.queuedCount += 1;
          timeline.queuedAccountIds.unshift((status.reblog || status).account.id);
        });
      },
      deleteStatus: (statusId) => {
        set((state) => {
          for (const timeline of Object.values(state.timelines)) {
            const entryIndex = timeline.entries.findIndex(
              (entry) => entry.type === 'status' && entry.id === statusId,
            );
            if (entryIndex !== -1) {
              timeline.entries.splice(entryIndex, 1);
            }
            const queuedEntryIndex = timeline.queuedEntries.findIndex(
              (queuedStatus) => queuedStatus.id === statusId,
            );
            if (queuedEntryIndex !== -1) {
              timeline.queuedEntries.splice(queuedEntryIndex, 1);
              timeline.queuedCount = Math.max(timeline.queuedCount - 1, 0);
            }
          }
        });
      },
      setLoading: (timelineId, isFetching) =>
        set((state) => {
          const timeline = state.timelines[timelineId] ?? createEmptyTimeline();

          timeline.isFetching = isFetching;
          if (!isFetching) timeline.isPending = false;
          state.timelines[timelineId] = timeline;
        }),
      setError: (timelineId, isError, statusCode) =>
        set((state) => {
          const timeline = state.timelines[timelineId] ?? createEmptyTimeline();

          timeline.isFetching = false;
          timeline.isPending = false;
          timeline.isError = isError ? statusCode || true : false;
          state.timelines[timelineId] = timeline;
        }),
      dequeueEntries: (timelineId) =>
        set((state) => {
          const timeline = state.timelines[timelineId];

          if (!timeline || timeline.queuedEntries.length === 0) return;

          const processedEntries = processPage(timeline.queuedEntries);

          timeline.newestStatusId = timeline.queuedEntries.toSorted().at(-1)!.id;
          timeline.entries.unshift(...processedEntries);
          timeline.queuedEntries = [];
          timeline.queuedCount = 0;
          timeline.queuedAccountIds = [];
        }),
      fillGap: (timelineId, gapMinId, statuses, hasMore, direction) =>
        set((state) => {
          const timeline = state.timelines[timelineId];
          if (!timeline) return;

          const gapIndex = timeline.entries.findIndex(
            (e) => e.type === 'gap' && e.minId === gapMinId,
          );
          if (gapIndex === -1) return;

          const gap = timeline.entries[gapIndex] as Extract<TimelineEntry, { type: 'gap' }>;
          const newEntries = processPage(statuses);

          timeline.entries.splice(gapIndex, 1);

          if (gapIndex === 0) {
            timeline.newestStatusId = statuses[0].id;
          }

          if (direction === 'up') {
            if (hasMore && statuses.length > 0) {
              const remainingGap: TimelineEntry = {
                type: 'gap',
                maxId: gap.maxId,
                maxIdDate: gap.maxIdDate,
                minId: statuses[0].id,
                minDate: statuses[0].created_at,
              };
              timeline.entries.splice(gapIndex, 0, remainingGap, ...newEntries);
            } else {
              timeline.entries.splice(gapIndex, 0, ...newEntries);
            }
          } else if (hasMore && statuses.length > 0) {
            const remainingGap: TimelineEntry = {
              type: 'gap',
              maxId: statuses.at(-1)?.id,
              maxIdDate: statuses.at(-1)?.created_at,
              minId: gap.minId,
              minDate: gap.minDate,
            };
            timeline.entries.splice(gapIndex, 0, ...newEntries, remainingGap);
          } else {
            timeline.entries.splice(gapIndex, 0, ...newEntries);
          }
        }),
      importPendingStatus: (params, idempotencyKey) =>
        set((state) => {
          if (params.scheduled_at) return;

          const timelineIds = getTimelinesForStatus(params);

          for (const timelineId of timelineIds) {
            const timeline = state.timelines[timelineId];
            if (!timeline) continue;

            if (
              timeline.entries.some((e) => e.type === 'pending-status' && e.id === idempotencyKey)
            )
              continue;

            timeline.entries.unshift({ type: 'pending-status', id: idempotencyKey });
          }
        }),
      replacePendingStatus: (idempotencyKey, status) =>
        set((state) => {
          for (const timeline of Object.values(state.timelines)) {
            const idx = timeline.entries.findIndex(
              (e) => e.type === 'pending-status' && e.id === idempotencyKey,
            );
            if (idx !== -1) {
              if (
                timeline.entries.some(
                  (entry) => entry.type === 'status' && entry.id === status.id,
                ) ||
                timeline.queuedEntries.some((queued) => queued.id === status.id)
              ) {
                timeline.entries.splice(idx, 1);
                return;
              }
              timeline.entries[idx] = {
                type: 'status',
                id: status.id,
                originalId: status.id,
                accountId: status.account.id,
                rebloggedBy: [],
                reblogIds: [],
                isReply: status.in_reply_to_id !== null,
                isReblog: false,
                isQuote: status.quote !== null,
                isDirect: status.visibility === 'direct',
                hasMedia: status.media_attachments.length > 0,
                hasMediaWithoutAltText: hasMediaWithoutAltText(status),
              };
            }
          }
        }),
      deletePendingStatus: (idempotencyKey) =>
        set((state) => {
          for (const timeline of Object.values(state.timelines)) {
            const idx = timeline.entries.findIndex(
              (e) => e.type === 'pending-status' && e.id === idempotencyKey,
            );
            if (idx !== -1) {
              timeline.entries.splice(idx, 1);
            }
          }
        }),
      filterTimelines: (accountId) =>
        set((state) => {
          const ownedStatuses = findStatuses(
            (status: NormalizedStatus) => status.account_id === accountId,
          );

          const statusIdsToRemove = new Set<string>();

          for (const [, status] of ownedStatuses) {
            statusIdsToRemove.add(status.id);
          }

          for (const timeline of Object.values(state.timelines)) {
            timeline.entries = timeline.entries.filter((entry) => {
              if (entry.type !== 'status') return true;
              if (statusIdsToRemove.has(entry.id)) return false;

              const index = entry.rebloggedBy.indexOf(accountId);
              if (index !== -1) entry.rebloggedBy.splice(index, 1);

              return true;
            });
            timeline.queuedEntries = timeline.queuedEntries.filter(
              (status) =>
                status.account.id !== accountId && status.reblog?.account.id !== accountId,
            );
            timeline.queuedCount = timeline.queuedEntries.length;
            timeline.queuedAccountIds = timeline.queuedAccountIds.filter((id) => id !== accountId);
          }
        }),
      resetTimeline: (timelineId) =>
        set((state) => {
          state.timelines[timelineId] = createEmptyTimeline();
        }),
      disablePolling: () =>
        set((state) => {
          state.pollingEnabled = false;
        }),
      resetErroredTimelines: () =>
        set((state) => {
          for (const timeline in Object.values(state.timelines)) {
            if (
              timeline in state.timelines &&
              state.timelines[timeline].isError &&
              state.timelines[timeline].entries.length === 0
            ) {
              delete state.timelines[timeline];
            }
          }
        }),
    },
  })),
);

const createEmptyTimeline = (): TimelineData => ({
  entries: [],
  queuedEntries: [],
  queuedCount: 0,
  queuedAccountIds: [],
  isFetching: false,
  isPending: true,
  isError: false,
  hasNextPage: true,
  oldestStatusId: undefined,
});

const emptyTimeline = createEmptyTimeline();

const useTimelinesActions = () => useTimelinesStore((state) => state.actions);

const useTimeline = (timelineId: string) =>
  useTimelinesStore((state) => state.timelines[timelineId] ?? emptyTimeline);

const useQueuedEntries = (timelineId: string, filters: TimelineFilters) => {
  const timeline = useTimelinesStore((state) => state.timelines[timelineId] ?? emptyTimeline);

  return useMemo(() => {
    if (!hasActiveFilters(filters))
      return {
        queuedCount: timeline.queuedCount,
        queuedAccountIds: timeline.queuedAccountIds,
      };

    const processed = processPage(timeline.queuedEntries);

    const visible: Array<StatusEntry> = processed.filter(
      (entry): entry is StatusEntry => entry.type === 'status' && !isEntryFiltered(entry, filters),
    );

    return {
      queuedCount: visible.length,
      queuedAccountIds: Array.from(new Set(visible.map((entry) => entry.accountId))).toReversed(),
    };
  }, [filters, timeline.queuedEntries]);
};

export {
  useTimelinesStore,
  useTimelinesActions,
  useTimeline,
  useQueuedEntries,
  type TimelineEntry,
  type StatusEntry,
};
