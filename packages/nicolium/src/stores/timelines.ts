import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import type { Status } from 'pl-api';

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
    }
  | {
      type: 'page-start';
      maxId?: string;
    }
  | {
      type: 'page-end';
      minId?: string;
    };

interface TimelineData {
  entries: Array<TimelineEntry>;
  queuedEntries: Array<TimelineEntry>;
  queuedCount: number;
  isFetching: boolean;
  isPending: boolean;
}

interface State {
  timelines: Record<string, TimelineData>;
  actions: {
    expandTimeline: (
      timelineId: string,
      statuses: Array<Status>,
      hasMore: boolean,
      initialFetch: boolean,
    ) => void;
    receiveStreamingStatus: (timelineId: string, status: Status) => void;
    deleteStatus: (statusId: string) => void;
    setLoading: (timelineId: string, isFetching: boolean) => void;
    dequeueEntries: (timelineId: string) => void;
  };
}

const processPage = (statuses: Array<Status>, hasMore: boolean): Array<TimelineEntry> => {
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
        existingEntry.rebloggedBy.push(status.account.id);
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

  if (hasMore)
    timelinePage.push({
      type: 'page-end',
      minId: statuses.at(-1)?.id,
    });

  return timelinePage;
};

const useTimelinesStore = create<State>()(
  mutative((set) => ({
    timelines: {} as Record<string, TimelineData>,
    actions: {
      expandTimeline: (timelineId, statuses, hasMore, initialFetch) =>
        set((state) => {
          const timeline = state.timelines[timelineId] ?? createEmptyTimeline();
          const entries = processPage(statuses, hasMore);

          if (initialFetch) timeline.entries = [];
          else if (timeline.entries.at(-1)?.type === 'page-end') timeline.entries.pop();
          timeline.entries.push(...entries);
          timeline.isPending = false;
          timeline.isFetching = false;
          state.timelines[timelineId] = timeline;
        }),
      receiveStreamingStatus: (timelineId, status) => {
        set((state) => {
          const timeline = state.timelines[timelineId];
          if (!timeline) return;

          if (timeline.entries.some((entry) => entry.type === 'status' && entry.id === status.id))
            return;

          timeline.queuedEntries.unshift({
            type: 'status',
            id: status.id,
            rebloggedBy: [],
          });
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
              (entry) => entry.type === 'status' && entry.id === statusId,
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
          const timeline = state.timelines[timelineId];

          if (!timeline) return;

          timeline.isFetching = isFetching;
          if (!isFetching) timeline.isPending = false;
        }),
      dequeueEntries: (timelineId) =>
        set((state) => {
          const timeline = state.timelines[timelineId];

          if (!timeline || timeline.queuedEntries.length === 0) return;

          timeline.entries.unshift(...timeline.queuedEntries);
          timeline.queuedEntries = [];
          timeline.queuedCount = 0;
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
});

const emptyTimeline = createEmptyTimeline();

const useTimelinesActions = () => useTimelinesStore((state) => state.actions);

const useTimeline = (timelineId: string) =>
  useTimelinesStore((state) => state.timelines[timelineId] ?? emptyTimeline);

export { useTimelinesStore, useTimelinesActions, useTimeline, type TimelineEntry };
