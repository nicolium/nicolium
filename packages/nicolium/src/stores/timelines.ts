import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { findStatuses } from '@/queries/statuses/use-status';

import type { NormalizedStatus } from '@/normalizers/status';
import type { CreateStatusParams, Status } from 'pl-api';

type TimelineEntry =
  | {
      type: 'status';
      id: string;
      rebloggedBy: Array<string>;
      isConnectedTop?: boolean;
      isConnectedBottom?: boolean;
    }
  | {
      type: 'pending-status';
      id: string;
    }
  | {
      type: 'gap';
      sinceId: string;
      maxId: string;
    };

interface TimelineData {
  entries: Array<TimelineEntry>;
  queuedEntries: Array<Status>;
  queuedCount: number;
  isFetching: boolean;
  isPending: boolean;
  hasNextPage: boolean;
  oldestStatusId?: string;
}

interface State {
  timelines: Record<string, TimelineData>;
  actions: {
    expandTimeline: (
      timelineId: string,
      statuses: Array<Status>,
      hasMore?: boolean,
      initialFetch?: boolean,
    ) => void;
    receiveStreamingStatus: (timelineId: string, status: Status) => void;
    deleteStatus: (statusId: string) => void;
    setLoading: (timelineId: string, isFetching: boolean) => void;
    dequeueEntries: (timelineId: string) => void;
    importPendingStatus: (params: CreateStatusParams, idempotencyKey: string) => void;
    replacePendingStatus: (idempotencyKey: string, newId: string) => void;
    deletePendingStatus: (idempotencyKey: string) => void;
    filterTimelines: (accountId: string) => void;
  };
}

const processPage = (statuses: Array<Status>): Array<TimelineEntry> => {
  const timelinePage: Array<TimelineEntry> = [];

  const processStatus = (status: Status): boolean => {
    if (timelinePage.some((entry) => entry.type === 'status' && entry.id === status.id))
      return false;

    let isConnectedTop = false;
    const inReplyToId = (status.reblog || status).in_reply_to_id;

    if (inReplyToId) {
      const foundStatus = statuses.find((s) => (s.reblog || s).id === inReplyToId);

      if (foundStatus) {
        if (processStatus(foundStatus)) {
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
        }
      } else {
        timelinePage.push({
          type: 'status',
          id: status.reblog.id,
          rebloggedBy: [status.account.id],
          isConnectedTop,
        });
      }
      return true;
    }

    timelinePage.push({
      type: 'status',
      id: status.id,
      rebloggedBy: [],
      isConnectedTop,
    });

    return true;
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
    actions: {
      expandTimeline: (timelineId, statuses, hasMore, initialFetch = false) =>
        set((state) => {
          const timeline = state.timelines[timelineId] ?? createEmptyTimeline();
          const entries = processPage(statuses);

          if (initialFetch) timeline.entries = entries;
          else timeline.entries.push(...entries);
          timeline.isPending = false;
          timeline.isFetching = false;
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

          if (timeline.entries.some((entry) => entry.type === 'status' && entry.id === status.id))
            return;

          timeline.queuedEntries.unshift(status);
          timeline.queuedCount += 1;
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
      dequeueEntries: (timelineId) =>
        set((state) => {
          const timeline = state.timelines[timelineId];

          if (!timeline || timeline.queuedEntries.length === 0) return;

          const processedEntries = processPage(timeline.queuedEntries);

          timeline.entries.unshift(...processedEntries);
          timeline.queuedEntries = [];
          timeline.queuedCount = 0;
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
      replacePendingStatus: (idempotencyKey, newId) =>
        set((state) => {
          for (const timeline of Object.values(state.timelines)) {
            const idx = timeline.entries.findIndex(
              (e) => e.type === 'pending-status' && e.id === idempotencyKey,
            );
            if (idx !== -1) {
              timeline.entries[idx] = {
                type: 'status',
                id: newId,
                rebloggedBy: [],
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
          }
        }),
    },
  })),
);

const createEmptyTimeline = (): TimelineData => ({
  entries: [],
  queuedEntries: [],
  queuedCount: 0,
  isFetching: false,
  isPending: true,
  hasNextPage: true,
  oldestStatusId: undefined,
});

const emptyTimeline = createEmptyTimeline();

const useTimelinesActions = () => useTimelinesStore((state) => state.actions);

const useTimeline = (timelineId: string) =>
  useTimelinesStore((state) => state.timelines[timelineId] ?? emptyTimeline);

export { useTimelinesStore, useTimelinesActions, useTimeline, type TimelineEntry };
