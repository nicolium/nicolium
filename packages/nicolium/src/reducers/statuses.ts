import { create } from 'mutative';
import {
  type Account as BaseAccount,
  type Status as BaseStatus,
  type CreateStatusParams,
  type MediaAttachment,
  type StatusWithoutAccount,
  mentionSchema,
} from 'pl-api';
import * as v from 'valibot';

import {
  EMOJI_REACT_FAIL,
  EMOJI_REACT_REQUEST,
  UNEMOJI_REACT_REQUEST,
  type EmojiReactsAction,
} from '@/actions/emoji-reacts';
import {
  EVENT_JOIN_REQUEST,
  EVENT_JOIN_FAIL,
  EVENT_LEAVE_REQUEST,
  EVENT_LEAVE_FAIL,
  type EventsAction,
} from '@/actions/events';
import { STATUS_IMPORT, STATUSES_IMPORT, type ImporterAction } from '@/actions/importer';
import {
  REBLOG_REQUEST,
  REBLOG_FAIL,
  UNREBLOG_REQUEST,
  UNREBLOG_FAIL,
  FAVOURITE_REQUEST,
  UNFAVOURITE_REQUEST,
  FAVOURITE_FAIL,
  DISLIKE_REQUEST,
  UNDISLIKE_REQUEST,
  DISLIKE_FAIL,
  type InteractionsAction,
} from '@/actions/interactions';
import {
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_FAIL,
  STATUS_DELETE_REQUEST,
  STATUS_DELETE_FAIL,
  STATUS_MUTE_SUCCESS,
  STATUS_UNFILTER,
  STATUS_UNMUTE_SUCCESS,
  type StatusesAction,
  STATUS_DELETE_SUCCESS,
} from '@/actions/statuses';
import { TIMELINE_DELETE, type TimelineAction } from '@/actions/timelines';
import { simulateEmojiReact, simulateUnEmojiReact } from '@/utils/emoji-reacts';
import { unescapeHTML } from '@/utils/html';

const domParser = new DOMParser();

type StatusApprovalStatus = Exclude<BaseStatus['approval_status'], null>;

type OldStatus = Pick<BaseStatus, 'content' | 'spoiler_text'> & { search_index: string };

// Gets titles of poll options from status
const getPollOptionTitles = (poll?: BaseStatus['poll']): readonly string[] => {
  if (poll && typeof poll === 'object') {
    return poll.options.map(({ title }) => title);
  } else {
    return [];
  }
};

// Gets usernames of mentioned users from status
const getMentionedUsernames = (status: Pick<BaseStatus, 'mentions'>): Array<string> =>
  status.mentions.map(({ acct }) => `@${acct}`);

// Creates search text from the status
const buildSearchContent = (
  status: Pick<BaseStatus, 'mentions' | 'spoiler_text' | 'content'>,
  poll?: BaseStatus['poll'],
): string => {
  const pollOptionTitles = getPollOptionTitles(poll);
  const mentionedUsernames = getMentionedUsernames(status);

  const fields = [status.spoiler_text, status.content, ...pollOptionTitles, ...mentionedUsernames];

  return unescapeHTML(fields.join('\n\n')) || '';
};

const getSearchIndex = (
  status: Omit<BaseStatus, 'account' | 'reblog' | 'quote' | 'poll' | 'group'>,
  oldStatus?: OldStatus,
  poll?: BaseStatus['poll'],
) => {
  if (
    oldStatus &&
    oldStatus.content === status.content &&
    oldStatus.spoiler_text === status.spoiler_text
  ) {
    return oldStatus.search_index;
  } else {
    const searchContent = buildSearchContent(status, poll);

    return domParser.parseFromString(searchContent, 'text/html').documentElement.textContent || '';
  }
};

const normalizeStatus = (
  {
    account,
    reblog,
    quote,
    poll,
    group,
    ...status
  }:
    | BaseStatus
    | (StatusWithoutAccount & {
        accounts?: Array<BaseAccount>;
      }),
  oldStatus?: OldStatus,
) => {
  const searchIndex = getSearchIndex(status, oldStatus, poll);

  // Sort the replied-to mention to the top
  let mentions = status.mentions.toSorted((a, _b) => {
    if (a.id === status.in_reply_to_account_id) {
      return -1;
    } else {
      return 0;
    }
  });

  const accountId = (account || (window as any).__PL_API_FALLBACK_ACCOUNT)?.id;

  // Add self to mentions if it's a reply to self
  const isSelfReply = accountId === status.in_reply_to_account_id;
  const hasSelfMention = status.mentions.some((mention) => accountId === mention.id);

  if (isSelfReply && !hasSelfMention) {
    const selfMention = v.parse(mentionSchema, account);
    mentions = [selfMention, ...mentions];
  }

  // Normalize event
  let event: BaseStatus['event'] &
    ({
      banner: MediaAttachment | null;
      links: Array<MediaAttachment>;
    } | null) = null;
  let media_attachments = status.media_attachments;

  if (status.event) {
    const firstAttachment = status.media_attachments[0];
    let banner: MediaAttachment | null = null;

    if (firstAttachment?.description === 'Banner' && firstAttachment.type === 'image') {
      banner = firstAttachment;
      media_attachments = media_attachments.slice(1);
    }

    const links = media_attachments.filter((attachment) => attachment.mime_type === 'text/html');
    media_attachments = media_attachments.filter(
      (attachment) => attachment.mime_type !== 'text/html',
    );

    event = {
      ...status.event,
      banner,
      links,
    };
  }

  return {
    account_id: accountId,
    reblog_id: reblog?.id ?? null,
    poll_id: poll?.id ?? null,
    group_id: group?.id ?? null,
    expectsCard: false,
    showFiltered: null as null | boolean,
    deleted: false,
    ...status,
    quote_id: status.quote_id ?? null,
    mentions,
    event,
    media_attachments,
    search_index: searchIndex,
  };
};

type NormalizedStatus = ReturnType<typeof normalizeStatus>;

type State = Record<string, NormalizedStatus>;

const importStatus = (state: State, status: BaseStatus | StatusWithoutAccount) => {
  const oldStatus = state[status.id];

  state[status.id] = normalizeStatus(status, oldStatus);
};

const importStatuses = (state: State, statuses: Array<BaseStatus | StatusWithoutAccount>) => {
  statuses.forEach((status) => {
    importStatus(state, status);
  });
};

const deleteStatus = (state: State, statusId: string, references: Array<[string, string]>) => {
  references.forEach((ref) => {
    deleteStatus(state, ref[0], []);
  });

  delete state[statusId];
};

const incrementReplyCount = (
  state: State,
  {
    in_reply_to_id,
    quote_id,
  }: Pick<BaseStatus | CreateStatusParams, 'in_reply_to_id' | 'quote_id'>,
) => {
  if (in_reply_to_id && state[in_reply_to_id]) {
    const parent = state[in_reply_to_id];
    parent.replies_count =
      (typeof parent.replies_count === 'number' ? parent.replies_count : 0) + 1;
  }

  if (quote_id && state[quote_id]) {
    const parent = state[quote_id];
    parent.quotes_count = (typeof parent.quotes_count === 'number' ? parent.quotes_count : 0) + 1;
  }

  return state;
};

const decrementReplyCount = (
  state: State,
  {
    in_reply_to_id,
    quote_id,
  }: Pick<BaseStatus | CreateStatusParams, 'in_reply_to_id' | 'quote_id'>,
) => {
  if (in_reply_to_id && state[in_reply_to_id]) {
    const parent = state[in_reply_to_id];
    parent.replies_count = Math.max(0, parent.replies_count - 1);
  }

  if (quote_id) {
    const parent = state[quote_id];
    parent.quotes_count = Math.max(0, parent.quotes_count - 1);
  }

  return state;
};

/** Simulate favourite/unfavourite of status for optimistic interactions */
const simulateFavourite = (state: State, statusId: string, favourited: boolean) => {
  const status = state[statusId];
  if (!status) return state;

  const delta = favourited ? +1 : -1;

  const updatedStatus = {
    ...status,
    favourited,
    favourites_count: Math.max(0, status.favourites_count + delta),
  };

  state[statusId] = updatedStatus;
};

/** Simulate dislike/undislike of status for optimistic interactions */
const simulateDislike = (state: State, statusId: string, disliked: boolean) => {
  const status = state[statusId];
  if (!status) return state;

  const delta = disliked ? +1 : -1;

  const updatedStatus = {
    ...status,
    disliked,
    dislikes_count: Math.max(0, status.dislikes_count + delta),
  };

  state[statusId] = updatedStatus;
};

const initialState: State = {};

const statuses = (
  state = initialState,
  action:
    | EmojiReactsAction
    | EventsAction
    | ImporterAction
    | InteractionsAction
    | StatusesAction
    | TimelineAction,
): State => {
  switch (action.type) {
    case STATUS_IMPORT:
      return create(state, (draft) => {
        importStatus(draft, action.status);
      });
    case STATUSES_IMPORT:
      return create(state, (draft) => {
        importStatuses(draft, action.statuses);
      });
    case STATUS_CREATE_REQUEST:
      return action.editing
        ? state
        : create(state, (draft) => incrementReplyCount(draft, action.params));
    case STATUS_CREATE_FAIL:
      return action.editing
        ? state
        : create(state, (draft) => decrementReplyCount(draft, action.params));
    case FAVOURITE_REQUEST:
      return create(state, (draft) => simulateFavourite(draft, action.statusId, true));
    case UNFAVOURITE_REQUEST:
      return create(state, (draft) => simulateFavourite(draft, action.statusId, false));
    case DISLIKE_REQUEST:
      return create(state, (draft) => simulateDislike(draft, action.statusId, true));
    case UNDISLIKE_REQUEST:
      return create(state, (draft) => simulateDislike(draft, action.statusId, false));
    case EMOJI_REACT_REQUEST:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.emoji_reactions = simulateEmojiReact(
            status.emoji_reactions,
            action.emoji,
            action.custom,
          );
        }
      });
    case UNEMOJI_REACT_REQUEST:
    case EMOJI_REACT_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.emoji_reactions = simulateUnEmojiReact(status.emoji_reactions, action.emoji);
        }
      });
    case FAVOURITE_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.favourited = false;
        }
      });
    case DISLIKE_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.disliked = false;
        }
      });
    case REBLOG_REQUEST:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.reblogs_count += 1;
          status.reblogged = true;
        }
      });
    case REBLOG_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.reblogged = false;
        }
      });
    case UNREBLOG_REQUEST:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.reblogs_count = Math.max(0, status.reblogs_count - 1);
          status.reblogged = false;
        }
      });
    case UNREBLOG_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.reblogged = true;
        }
      });
    case STATUS_MUTE_SUCCESS:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.muted = true;
        }
      });
    case STATUS_UNMUTE_SUCCESS:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.muted = false;
        }
      });
    case STATUS_DELETE_REQUEST:
      return create(state, (draft) => decrementReplyCount(draft, action.params));
    case STATUS_DELETE_FAIL:
      return create(state, (draft) => incrementReplyCount(draft, action.params));
    case STATUS_UNFILTER:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.showFiltered = true;
        }
      });
    case TIMELINE_DELETE:
      return create(state, (draft) => {
        deleteStatus(draft, action.statusId, action.references);
      });
    case EVENT_JOIN_REQUEST:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status?.event) {
          status.event.join_state = 'pending';
        }
      });
    case EVENT_JOIN_FAIL:
    case EVENT_LEAVE_REQUEST:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status?.event) {
          status.event.join_state = null;
        }
      });
    case EVENT_LEAVE_FAIL:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status?.event) {
          status.event.join_state = action.previousState;
        }
      });
    case STATUS_DELETE_SUCCESS:
      return create(state, (draft) => {
        const status = draft[action.statusId];
        if (status) {
          status.deleted = true;
        }
      });
    default:
      return state;
  }
};

export { statuses as default, type StatusApprovalStatus, normalizeStatus, type NormalizedStatus };
