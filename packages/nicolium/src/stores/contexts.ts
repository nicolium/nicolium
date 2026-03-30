import { useMemo } from 'react';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { findStatuses } from '@/queries/statuses/use-status';

import type { Context, Status } from 'pl-api';

/** Minimal status fields needed to process context. */
type ContextStatus = Pick<Status, 'id' | 'in_reply_to_id' | 'parent_visible'>;

/** Import a single status into the reducer, setting replies and replyTos. */
const importStatus = (state: State, status: ContextStatus, idempotencyKey?: string) => {
  const { id, in_reply_to_id: inReplyToId, parent_visible: parentVisible } = status;
  if (!inReplyToId) return;

  const replies = state.replies[inReplyToId] || [];
  const newReplies = [...new Set([...replies, id])].toSorted();

  state.replies[inReplyToId] = newReplies;
  state.inReplyTos[id] = parentVisible === false ? `${inReplyToId}-unavailable` : inReplyToId;

  if (idempotencyKey) {
    deletePendingStatus(state, status.in_reply_to_id, idempotencyKey);
  }
};

const importStatuses = (state: State, statuses: ContextStatus[]) => {
  statuses.forEach((status) => {
    importStatus(state, status);
  });
};

/** Insert a fake status ID connecting descendant to ancestor. */
const insertTombstone = (state: State, ancestorId: string, descendantId: string) => {
  const tombstoneId = `${descendantId}-tombstone`;
  importStatus(state, { id: tombstoneId, in_reply_to_id: ancestorId, parent_visible: undefined });
  importStatus(state, { id: descendantId, in_reply_to_id: tombstoneId, parent_visible: undefined });
};

/** Find the highest level status from this statusId. */
const getRootNode = (state: State, statusId: string, initialId = statusId): string => {
  const parent = state.inReplyTos[statusId];

  if (!parent) {
    return statusId;
  } else if (parent === initialId) {
    // Prevent cycles
    return parent;
  } else {
    return getRootNode(state, parent, initialId);
  }
};

/** Route fromId to toId by inserting tombstones. */
const connectNodes = (state: State, fromId: string, toId: string) => {
  const fromRoot = getRootNode(state, fromId);
  const toRoot = getRootNode(state, toId);

  if (fromRoot !== toRoot) {
    insertTombstone(state, toId, fromId);
  }
};

/** Import a branch of ancestors or descendants, in relation to statusId. */
const importBranch = (state: State, statuses: ContextStatus[], statusId?: string) => {
  statuses.forEach((status, i) => {
    const prevId = statusId && i === 0 ? statusId : statuses[i - 1]?.id;

    if (status.in_reply_to_id) {
      importStatus(state, status);

      // On Mastodon, in_reply_to_id can refer to an unavailable status,
      // so traverse the tree up and insert a connecting tombstone if needed.
      if (statusId) {
        connectNodes(state, status.id, statusId);
      }
    } else if (prevId) {
      // On Pleroma, in_reply_to_id will be null if the parent is unavailable,
      // so insert the tombstone now.
      insertTombstone(state, prevId, status.id);
    }
  });
};

interface State {
  inReplyTos: Record<string, string>;
  replies: Record<string, Array<string>>;
  actions: {
    /** Delete statuses from an account upon blocking or muting. */
    filterContexts: (relationship: { id: string }) => void;
    /** Import a status's ancestors and descendants. */
    importContext: (statusId: string, context: Context) => void;
    /** Add a fake status ID for a pending status. */
    importPendingStatus: (inReplyToId: string | null | undefined, idempotencyKey: string) => void;
    /** Delete a pending status from the reducer. */
    deletePendingStatus: (inReplyToId: string | null | undefined, idempotencyKey: string) => void;
    /** Import a single status into the reducer, setting replies and replyTos. */
    importStatus: (status: ContextStatus, idempotencyKey?: string) => void;
    /** Import multiple statuses into the state. */
    importStatuses: (statuses: Array<ContextStatus>) => void;
    /** Delete multiple statuses from the reducer. */
    deleteStatuses: (statusIds: Array<string>) => void;
  };
}

interface ContextOwnedStatus {
  id: string;
  account?: { id: string } | null;
  account_id?: string | null;
}

/** Remove a status from the reducer. */
const deleteStatus = (state: State, statusId: string) => {
  const parentId = state.inReplyTos[statusId];
  if (parentId) {
    const parentReplies = state.replies[parentId] || [];
    const newParentReplies = parentReplies.filter((id) => id !== statusId);
    state.replies[parentId] = newParentReplies;
  }

  const replies = (state.replies[statusId] = []);
  replies.forEach((reply) => delete state.inReplyTos[reply]);

  delete state.inReplyTos[statusId];
  delete state.replies[statusId];
};

/** Delete multiple statuses from the reducer. */
const deleteStatuses = (state: State, statusIds: string[]) => {
  statusIds.forEach((statusId) => {
    deleteStatus(state, statusId);
  });
};

const getStatusAccountId = (status: ContextOwnedStatus) => status.account_id ?? status.account?.id;

/** Delete a pending status from the reducer. */
const deletePendingStatus = (
  state: State,
  inReplyToId: string | null | undefined,
  idempotencyKey: string,
) => {
  const id = `末pending-${idempotencyKey}`;

  delete state.inReplyTos[id];

  if (inReplyToId) {
    const replies = state.replies[inReplyToId] || [];
    const newReplies = replies.filter((replyId) => replyId !== id).toSorted();
    state.replies[inReplyToId] = newReplies;
  }
};

const useContextStore = create<State>()(
  mutative((set) => ({
    inReplyTos: {},
    replies: {},
    actions: {
      filterContexts: (relationship) =>
        set((state) => {
          const ownedStatusIds = findStatuses(
            (status) => getStatusAccountId(status) === relationship.id,
          ).map(([id]) => id);

          deleteStatuses(state, ownedStatusIds);
        }),
      importContext: (statusId: string, { ancestors, descendants }: Context) =>
        set((state) => {
          importBranch(state, ancestors);
          importBranch(state, descendants, statusId);

          if (ancestors.length > 0 && !state.inReplyTos[statusId]) {
            insertTombstone(state, ancestors[ancestors.length - 1].id, statusId);
          }
        }),
      importPendingStatus: (inReplyToId, idempotencyKey) =>
        set((state) => {
          const id = `末pending-${idempotencyKey}`;
          importStatus(state, { id, in_reply_to_id: inReplyToId ?? null, parent_visible: undefined });
        }),
      deletePendingStatus: (inReplyToId, idempotencyKey) =>
        set((state) => {
          const id = `末pending-${idempotencyKey}`;

          delete state.inReplyTos[id];

          if (inReplyToId) {
            const replies = state.replies[inReplyToId] || [];
            const newReplies = replies.filter((replyId) => replyId !== id).toSorted();
            state.replies[inReplyToId] = newReplies;
          }
        }),
      importStatus: (status, idempotencyKey) =>
        set((state) => {
          importStatus(state, status, idempotencyKey);
        }),
      importStatuses: (statuses) =>
        set((state) => {
          importStatuses(state, statuses);
        }),
      deleteStatuses: (statusIds) =>
        set((state) => {
          deleteStatuses(state, statusIds);
        }),
    },
  })),
);

const getAncestorsIds = (statusId: string, inReplyTos: Record<string, string>): Array<string> => {
  let ancestorsIds: Array<string> = [];
  let id: string = statusId;

  while (id && !ancestorsIds.includes(id)) {
    ancestorsIds = [id, ...ancestorsIds];
    id = inReplyTos[id];
  }

  return [...new Set(ancestorsIds)];
};

const getDescendantsIds = (statusId: string, contextReplies: Record<string, string[]>) => {
  let descendantsIds: Array<string> = [];
  const ids = [statusId];

  while (ids.length > 0) {
    const id = ids.shift();
    if (!id) break;

    const replies = contextReplies[id];

    if (descendantsIds.includes(id)) {
      break;
    }

    if (statusId !== id) {
      descendantsIds = [...descendantsIds, id];
    }

    if (replies) {
      replies.toReversed().forEach((reply: string) => {
        ids.unshift(reply);
      });
    }
  }

  return [...new Set(descendantsIds)];
};

const useDescendantsIds = (statusId?: string) => {
  const replies = useContextStore((state) => state.replies);

  return useMemo(
    () => (statusId ? getDescendantsIds(statusId, replies).filter((id) => id !== statusId) : []),
    [replies, statusId],
  );
};

const useThreadDepths = (statusId?: string) => {
  const inReplyTos = useContextStore((state) => state.inReplyTos);
  const replies = useContextStore((state) => state.replies);

  return useMemo(() => {
    const depths: Record<string, number> = {};
    if (!statusId) return depths;

    const ancestorsIds = getAncestorsIds(statusId, inReplyTos);
    for (const id of ancestorsIds) depths[id] = 0;
    depths[statusId] = 0;

    const queue: Array<{ id: string; depth: number }> = [{ id: statusId, depth: -1 }];
    const visited = new Set<string>([statusId]);

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      for (const childId of replies[id] || []) {
        if (visited.has(childId)) continue;
        visited.add(childId);
        depths[childId] = Math.max(0, depth + 1);
        queue.push({ id: childId, depth: depth + 1 });
      }
    }

    return depths;
  }, [inReplyTos, replies, statusId]);
};

const useThread = (statusId?: string, linear?: boolean) => {
  const inReplyTos = useContextStore((state) => state.inReplyTos);
  const replies = useContextStore((state) => state.replies);

  return useMemo(() => {
    if (!statusId) return [];

    if (linear) {
      let parentStatus: string = statusId;
      const visited = new Set<string>([parentStatus]);

      while (inReplyTos[parentStatus]) {
        const next = inReplyTos[parentStatus];
        if (visited.has(next)) break;
        visited.add(next);
        parentStatus = next;
      }

      const threadStatuses = [parentStatus];

      for (let i = 0; i < threadStatuses.length; i++) {
        for (const reply of replies[threadStatuses[i]] || []) {
          if (!threadStatuses.includes(reply)) threadStatuses.push(reply);
        }
      }

      return threadStatuses.toSorted();
    }

    let ancestorsIds = getAncestorsIds(statusId, inReplyTos);
    let descendantsIds = getDescendantsIds(statusId, replies);

    ancestorsIds = ancestorsIds.filter((id) => id !== statusId && !descendantsIds.includes(id));
    descendantsIds = descendantsIds.filter((id) => id !== statusId && !ancestorsIds.includes(id));

    return [...ancestorsIds, statusId, ...descendantsIds];
  }, [inReplyTos, replies, statusId, linear]);
};

const useReplyToId = (statusId?: string) =>
  useContextStore((state) => (statusId ? state.inReplyTos[statusId] : undefined));

const useReplyCount = (statusId?: string) =>
  useContextStore((state) => (statusId ? (state.replies[statusId]?.length ?? 0) : 0));

const useContextsActions = () => useContextStore((state) => state.actions);

export {
  useContextStore,
  useDescendantsIds,
  useThread,
  useThreadDepths,
  useReplyToId,
  useReplyCount,
  useContextsActions,
};
