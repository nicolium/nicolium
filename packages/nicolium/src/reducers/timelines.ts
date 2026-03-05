import { create } from 'mutative';

import {
  TIMELINE_UPDATE,
  TIMELINE_DELETE,
  TIMELINE_CLEAR,
  TIMELINE_EXPAND_SUCCESS,
  TIMELINE_EXPAND_REQUEST,
  TIMELINE_EXPAND_FAIL,
  TIMELINE_UPDATE_QUEUE,
  TIMELINE_DEQUEUE,
  MAX_QUEUED_ITEMS,
  TIMELINE_SCROLL_TOP,
  type TimelineAction,
} from '@/actions/timelines';

import type { PaginatedResponse, Status as BaseStatus } from 'pl-api';

type ImportPosition = 'start' | 'end';

const TRUNCATE_LIMIT = 40;
const TRUNCATE_SIZE = 20;

interface Timeline {
  unread: number;
  top: boolean;
  isLoading: boolean;
  hasMore: boolean;
  next: (() => Promise<PaginatedResponse<BaseStatus>>) | null;
  prev: (() => Promise<PaginatedResponse<BaseStatus>>) | null;
  items: Array<string>;
  queuedItems: Array<string>; //max= MAX_QUEUED_ITEMS
  totalQueuedItemsCount: number; //used for queuedItems overflow for MAX_QUEUED_ITEMS+
  loadingFailed: boolean;
  isPartial: boolean;
  loaded: boolean;
}

const newTimeline = (): Timeline => ({
  unread: 0,
  top: true,
  isLoading: false,
  hasMore: true,
  next: null,
  prev: null,
  items: [],
  queuedItems: [], //max= MAX_QUEUED_ITEMS
  totalQueuedItemsCount: 0, //used for queuedItems overflow for MAX_QUEUED_ITEMS+
  loadingFailed: false,
  isPartial: false,
  loaded: false,
});

const initialState: State = {};

type State = Record<string, Timeline>;

const getStatusIds = (statuses: Array<Pick<BaseStatus, 'id'>> = []) =>
  statuses.map((status) => status.id);

const mergeStatusIds = (oldIds: Array<string>, newIds: Array<string>) => [
  ...new Set([...newIds, ...oldIds]),
];

const addStatusId = (oldIds = Array<string>(), newId: string) => mergeStatusIds(oldIds, [newId]);

// Like `take`, but only if the collection's size exceeds truncateLimit
const truncate = (items: Array<string>, truncateLimit: number, newSize: number) =>
  items.length > truncateLimit ? items.slice(0, newSize) : items;

const truncateIds = (items: Array<string>) => truncate(items, TRUNCATE_LIMIT, TRUNCATE_SIZE);

const updateTimeline = (
  state: State,
  timelineId: string,
  updater: (timeline: Timeline) => void,
) => {
  state[timelineId] = state[timelineId] || newTimeline();
  updater(state[timelineId]);
};

const setLoading = (state: State, timelineId: string, loading: boolean) => {
  updateTimeline(state, timelineId, (timeline) => {
    timeline.isLoading = loading;
  });
};

// Keep track of when a timeline failed to load
const setFailed = (state: State, timelineId: string, failed: boolean) => {
  updateTimeline(state, timelineId, (timeline) => {
    timeline.loadingFailed = failed;
  });
};

const expandNormalizedTimeline = (
  state: State,
  timelineId: string,
  statuses: Array<BaseStatus>,
  next: (() => Promise<PaginatedResponse<BaseStatus>>) | null,
  prev: (() => Promise<PaginatedResponse<BaseStatus>>) | null,
  isPartial: boolean,
  pos: ImportPosition = 'end',
) => {
  const newIds = getStatusIds(statuses);

  updateTimeline(state, timelineId, (timeline) => {
    timeline.isLoading = false;
    timeline.loadingFailed = false;
    timeline.isPartial = isPartial;
    timeline.next = next;
    timeline.prev = prev;
    timeline.loaded = true;

    if (!next) timeline.hasMore = false;

    if (newIds.length) {
      if (pos === 'end') {
        timeline.items = mergeStatusIds(newIds, timeline.items);
      } else {
        timeline.items = mergeStatusIds(timeline.items, newIds);
      }
    }
  });
};

const appendStatus = (state: State, timelineId: string, statusId: string) => {
  const top = state[timelineId]?.top;
  const oldIds = state[timelineId]?.items || [];
  const unread = state[timelineId]?.unread || 0;

  if (oldIds.includes(statusId) || state[timelineId]?.queuedItems.includes(statusId)) return state;

  const newIds = addStatusId(oldIds, statusId);

  updateTimeline(state, timelineId, (timeline) => {
    if (top) {
      // For performance, truncate items if user is scrolled to the top
      timeline.items = truncateIds(newIds);
    } else {
      timeline.unread = unread + 1;
      timeline.items = newIds;
    }
  });
};

const updateTimelineQueue = (state: State, timelineId: string, statusId: string) => {
  updateTimeline(state, timelineId, (timeline) => {
    const {
      queuedItems: queuedIds,
      items: listedIds,
      totalQueuedItemsCount: queuedCount,
    } = timeline;

    if (queuedIds.includes(statusId)) return;
    if (listedIds.includes(statusId)) return;

    timeline.totalQueuedItemsCount = queuedCount + 1;
    timeline.queuedItems = addStatusId(queuedIds, statusId).slice(0, MAX_QUEUED_ITEMS);
  });
};

const shouldDelete = (timelineId: string, excludeAccount: string | null) => {
  if (!excludeAccount) return true;
  if (timelineId === `account:${excludeAccount}`) return false;
  if (timelineId.startsWith(`account:${excludeAccount}:`)) return false;
  return true;
};

const deleteStatus = (
  state: State,
  statusId: string,
  references: Array<[string]> | Array<[string, string]>,
  excludeAccount: string | null,
) => {
  for (const timelineId in state) {
    if (shouldDelete(timelineId, excludeAccount)) {
      state[timelineId].items = state[timelineId].items.filter((id) => id !== statusId);
      state[timelineId].queuedItems = state[timelineId].queuedItems.filter((id) => id !== statusId);
    }
  }

  // Remove reblogs of deleted status
  references.forEach((ref) => {
    deleteStatus(state, ref[0], [], excludeAccount);
  });
};

const clearTimeline = (state: State, timelineId: string) => {
  state[timelineId] = newTimeline();
};

const updateTop = (state: State, timelineId: string, top: boolean) => {
  updateTimeline(state, timelineId, (timeline) => {
    if (top) timeline.unread = 0;
    timeline.top = top;
  });
};

const timelineDequeue = (state: State, timelineId: string) => {
  updateTimeline(state, timelineId, (timeline) => {
    const top = timeline.top;

    const queuedIds = timeline.queuedItems;

    const newIds = mergeStatusIds(timeline.items, queuedIds);
    timeline.items = top ? truncateIds(newIds) : newIds;

    timeline.queuedItems = [];
    timeline.totalQueuedItemsCount = 0;
  });
};

const handleExpandFail = (state: State, timelineId: string) => {
  setLoading(state, timelineId, false);
  setFailed(state, timelineId, true);
};

const timelines = (state: State = initialState, action: TimelineAction): State => {
  switch (action.type) {
    case TIMELINE_EXPAND_REQUEST:
      return create(state, (draft) => {
        setLoading(draft, action.timeline, true);
      });
    case TIMELINE_EXPAND_FAIL:
      return create(state, (draft) => {
        handleExpandFail(draft, action.timeline);
      });
    case TIMELINE_EXPAND_SUCCESS:
      return create(state, (draft) => {
        expandNormalizedTimeline(
          draft,
          action.timeline,
          action.statuses,
          action.next,
          action.prev,
          action.partial,
        );
      });
    case TIMELINE_UPDATE:
      return create(state, (draft) => appendStatus(draft, action.timeline, action.statusId));
    case TIMELINE_UPDATE_QUEUE:
      return create(state, (draft) => {
        updateTimelineQueue(draft, action.timeline, action.statusId);
      });
    case TIMELINE_DEQUEUE:
      return create(state, (draft) => {
        timelineDequeue(draft, action.timeline);
      });
    case TIMELINE_DELETE:
      return create(state, (draft) => {
        deleteStatus(draft, action.statusId, action.references, action.reblogOf);
      });
    case TIMELINE_CLEAR:
      return create(state, (draft) => {
        clearTimeline(draft, action.timeline);
      });
    case TIMELINE_SCROLL_TOP:
      return create(state, (draft) => {
        updateTop(draft, action.timeline, action.top);
      });
    default:
      return state;
  }
};

export { timelines as default };
