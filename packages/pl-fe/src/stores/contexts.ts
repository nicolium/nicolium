import { useMemo } from 'react';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import type { Context, Status } from 'pl-api';

/** Minimal status fields needed to process context. */
type ContextStatus = Pick<Status, 'id' | 'in_reply_to_id'>;

/** Import a single status into the reducer, setting replies and replyTos. */
const importStatus = (state: State, status: ContextStatus, idempotencyKey?: string) => {
  const { id, in_reply_to_id: inReplyToId } = status;
  if (!inReplyToId) return;

  const replies = state.replies[inReplyToId] || [];
  const newReplies = [...new Set([...replies, id])].toSorted();

  state.replies[inReplyToId] = newReplies;
  state.inReplyTos[id] = inReplyToId;

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
  importStatus(state, { id: tombstoneId, in_reply_to_id: ancestorId });
  importStatus(state, { id: descendantId, in_reply_to_id: tombstoneId });
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
    /** Delete statuses upon blocking or muting a user. */
    filterContexts: (
      relationship: { id: string },
      statuses: Record<string, ContextOwnedStatus>,
    ) => void;
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
      filterContexts: (relationship, statuses) =>
        set((state) => {
          const ownedStatusIds = Object.values(statuses)
            .filter((status) => getStatusAccountId(status) === relationship.id)
            .map((status) => status.id);

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
          importStatus(state, { id, in_reply_to_id: inReplyToId ?? null });
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

const useAncestorsIds = (statusId?: string) => {
  const inReplyTos = useContextStore((state) => state.inReplyTos);

  return useMemo(
    () => (statusId ? getAncestorsIds(statusId, inReplyTos).filter((id) => id !== statusId) : []),
    [inReplyTos, statusId],
  );
};

const useDescendantsIds = (statusId?: string) => {
  const replies = useContextStore((state) => state.replies);

  return useMemo(
    () => (statusId ? getDescendantsIds(statusId, replies).filter((id) => id !== statusId) : []),
    [replies, statusId],
  );
};

const useThread = (statusId?: string, linear?: boolean) => {
  const inReplyTos = useContextStore((state) => state.inReplyTos);
  const replies = useContextStore((state) => state.replies);

  return useMemo(() => {
    if (!statusId) return [];

    if (linear) {
      let parentStatus: string = statusId;

      while (inReplyTos[parentStatus]) {
        parentStatus = inReplyTos[parentStatus];
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

const useReplyToId = (statusId?: string) => {
  const inReplyTos = useContextStore((state) => state.inReplyTos);

  return useMemo(() => {
    if (!statusId) return undefined;
    return inReplyTos[statusId];
  }, [inReplyTos, statusId]);
};

const useReplyCount = (statusId?: string) => {
  const replies = useContextStore((state) => state.replies);

  return useMemo(() => {
    if (!statusId) return 0;
    return replies[statusId]?.length || 0;
  }, [replies, statusId]);
};

const useContextsActions = () => useContextStore((state) => state.actions);

export {
  useContextStore,
  useAncestorsIds,
  useDescendantsIds,
  useThread,
  useReplyToId,
  useReplyCount,
  useContextsActions,
};
