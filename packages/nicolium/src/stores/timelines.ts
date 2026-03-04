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
    setLoading: (timelineId: string, isFetching: boolean) => void;
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
      setLoading: (timelineId, isFetching) =>
        set((state) => {
          const timeline = state.timelines[timelineId];

          if (!timeline) return;

          timeline.isFetching = isFetching;
          if (!isFetching) timeline.isPending = false;
        }),
    },
  })),
);

const createEmptyTimeline = (): TimelineData => ({
  entries: [],
  isFetching: false,
  isPending: true,
});

const emptyTimeline = createEmptyTimeline();

const useTimelinesActions = () => useTimelinesStore((state) => state.actions);

const useTimeline = (timelineId: string) =>
  useTimelinesStore((state) => state.timelines[timelineId] ?? emptyTimeline);

export { useTimelinesStore, useTimelinesActions, useTimeline, type TimelineEntry };
