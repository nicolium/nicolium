import { create } from 'mutative';

import { INSTANCE_FETCH_SUCCESS, type InstanceAction } from 'pl-fe/actions/instance';

import {
  COMPOSE_CHANGE,
  COMPOSE_REPLY,
  COMPOSE_REPLY_CANCEL,
  COMPOSE_QUOTE,
  COMPOSE_QUOTE_CANCEL,
  COMPOSE_GROUP_POST,
  COMPOSE_DIRECT,
  COMPOSE_MENTION,
  COMPOSE_SUBMIT_REQUEST,
  COMPOSE_SUBMIT_SUCCESS,
  COMPOSE_SUBMIT_FAIL,
  COMPOSE_UPLOAD_REQUEST,
  COMPOSE_UPLOAD_SUCCESS,
  COMPOSE_UPLOAD_FAIL,
  COMPOSE_UPLOAD_UNDO,
  COMPOSE_UPLOAD_PROGRESS,
  COMPOSE_SUGGESTIONS_CLEAR,
  COMPOSE_SUGGESTIONS_READY,
  COMPOSE_SUGGESTION_SELECT,
  COMPOSE_SUGGESTION_TAGS_UPDATE,
  COMPOSE_SPOILERNESS_CHANGE,
  COMPOSE_TYPE_CHANGE,
  COMPOSE_SPOILER_TEXT_CHANGE,
  COMPOSE_VISIBILITY_CHANGE,
  COMPOSE_LANGUAGE_CHANGE,
  COMPOSE_MODIFIED_LANGUAGE_CHANGE,
  COMPOSE_LANGUAGE_ADD,
  COMPOSE_LANGUAGE_DELETE,
  COMPOSE_ADD_SUGGESTED_LANGUAGE,
  COMPOSE_UPLOAD_CHANGE_REQUEST,
  COMPOSE_UPLOAD_CHANGE_SUCCESS,
  COMPOSE_UPLOAD_CHANGE_FAIL,
  COMPOSE_RESET,
  COMPOSE_POLL_ADD,
  COMPOSE_POLL_REMOVE,
  COMPOSE_SCHEDULE_ADD,
  COMPOSE_SCHEDULE_SET,
  COMPOSE_SCHEDULE_REMOVE,
  COMPOSE_POLL_OPTION_ADD,
  COMPOSE_POLL_OPTION_CHANGE,
  COMPOSE_POLL_OPTION_REMOVE,
  COMPOSE_POLL_SETTINGS_CHANGE,
  COMPOSE_ADD_TO_MENTIONS,
  COMPOSE_REMOVE_FROM_MENTIONS,
  COMPOSE_SET_STATUS,
  COMPOSE_EVENT_REPLY,
  COMPOSE_EDITOR_STATE_SET,
  COMPOSE_CHANGE_MEDIA_ORDER,
  COMPOSE_ADD_SUGGESTED_QUOTE,
  COMPOSE_FEDERATED_CHANGE,
  COMPOSE_INTERACTION_POLICY_OPTION_CHANGE,
  COMPOSE_CLEAR_LINK_SUGGESTION_CREATE,
  COMPOSE_CLEAR_LINK_SUGGESTION_IGNORE,
  COMPOSE_PREVIEW_SUCCESS,
  COMPOSE_PREVIEW_CANCEL,
  COMPOSE_HASHTAG_CASING_SUGGESTION_SET,
  COMPOSE_HASHTAG_CASING_SUGGESTION_IGNORE,
  type ComposeAction,
  type ComposeSuggestionSelectAction,
  COMPOSE_REDACTING_OVERWRITE_CHANGE,
} from '../actions/compose';
import { EVENT_COMPOSE_CANCEL, EVENT_FORM_SET, type EventsAction } from '../actions/events';
import { ME_FETCH_SUCCESS, ME_PATCH_SUCCESS, type MeAction } from '../actions/me';
import { FE_NAME } from '../actions/settings';
import { TIMELINE_DELETE, type TimelineAction } from '../actions/timelines';
import { unescapeHTML } from '../utils/html';

import type { Account, CredentialAccount, Instance, InteractionPolicy, MediaAttachment, Status as BaseStatus, Tag } from 'pl-api';
import type { Emoji } from 'pl-fe/features/emoji';
import type { Language } from 'pl-fe/features/preferences';
import type { Status } from 'pl-fe/normalizers/status';

const getResetFileKey = () => Math.floor((Math.random() * 0x10000));

interface ComposePoll {
  options: Array<string>;
  options_map: Array<Record<Language | string, string>>;
  expires_in: number;
  multiple: boolean;
  hide_totals: boolean;
}

const newPoll = (params: Partial<ComposePoll> = {}): ComposePoll => ({
  options: ['', ''],
  options_map: [{}, {}],
  expires_in: 24 * 3600,
  multiple: false,
  hide_totals: false,
  ...params,
});

interface ClearLinkSuggestion {
  key: string;
  originalUrl: string;
  cleanUrl: string;
}

interface Compose {
  // User-edited text
  editorState: string | null;
  editorStateMap: Record<Language | string, string | null>;
  spoilerText: string;
  spoilerTextMap: Record<Language | string, string>;
  text: string;
  textMap: Record<Language | string, string>;

  // Non-text content
  mediaAttachments: Array<MediaAttachment>;
  poll: ComposePoll | null;

  // Post settings
  contentType: string;
  interactionPolicy: InteractionPolicy | null;
  language: Language | string | null;
  local_only: boolean;
  scheduledAt: Date | null;
  sensitive: boolean;
  visibility: string;

  // References to other posts/groups/users
  draftId: string | null;
  groupId: string | null;
  id: string | null;
  inReplyToId: string | null;
  quote: string | null;
  to: Array<string>;
  parentRebloggedById: string | null;

  // State flags
  isChangingUpload: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  progress: number;

  // Internal
  caretPosition: number | null;
  idempotencyKey: string;
  resetFileKey: number | null;

  // Currently modified language
  modifiedLanguage: Language | string | null;

  // Suggestions
  approvalRequired: boolean;
  clearLinkSuggestion: ClearLinkSuggestion | null;
  dismissedClearLinksSuggestions: Array<string>;
  dismissedQuotes: Array<string>;
  hashtagCasingSuggestion: string | null;
  hashtagCasingSuggestionIgnored: boolean | null;
  preview: Partial<BaseStatus> | null;
  suggestedLanguage: string | null;
  suggestions: Array<string> | Array<Emoji>;

  // Moderation features
  redacting: boolean;
  redactingOverwrite: boolean;
}

const newCompose = (params: Partial<Compose> = {}): Compose => ({
  editorState: null,
  editorStateMap: {},
  spoilerText: '',
  spoilerTextMap: {},
  text: '',
  textMap: {},

  mediaAttachments: [],
  poll: null,

  contentType: 'text/plain',
  interactionPolicy: null,
  language: null,
  local_only: false,
  scheduledAt: null,
  sensitive: false,
  visibility: 'public',

  draftId: null,
  groupId: null,
  id: null,
  inReplyToId: null,
  quote: null,
  to: [],
  parentRebloggedById: null,

  isChangingUpload: false,
  isSubmitting: false,
  isUploading: false,
  progress: 0,

  caretPosition: null,
  idempotencyKey: '',
  resetFileKey: null,

  modifiedLanguage: null,

  approvalRequired: false,
  clearLinkSuggestion: null,
  dismissedClearLinksSuggestions: [],
  dismissedQuotes: [],
  hashtagCasingSuggestion: null,
  hashtagCasingSuggestionIgnored: null,
  preview: null,
  suggestedLanguage: null,
  suggestions: [],

  redacting: false,
  redactingOverwrite: false,

  ...params,
});

type State = {
  default: Compose;
  [key: string]: Compose;
};

const statusToTextMentions = (status: Pick<Status, 'account' | 'mentions'>, account: Pick<Account, 'acct'>) => {
  const author = status.account.acct;
  const mentions = status.mentions.map((m) => m.acct) || [];

  return [...new Set([author, ...mentions].filter(acct => acct !== account.acct))].map(m => `@${m} `).join('');
};

const statusToMentionsArray = (status: Pick<Status, 'account' | 'mentions'>, account: Pick<Account, 'acct'>, rebloggedBy?: Pick<Account, 'acct'>) => {
  const author = status.account.acct;
  const mentions = status.mentions.map((m) => m.acct) || [];

  return [...new Set([author, ...(rebloggedBy ? [rebloggedBy.acct] : []), ...mentions].filter(acct => acct !== account.acct))];
};

const statusToMentionsAccountIdsArray = (status: Pick<Status, 'mentions' | 'account'>, account: Pick<Account, 'id'>, parentRebloggedBy?: string | null) => {
  const mentions = status.mentions.map((m) => m.id);

  return [...new Set([status.account.id, ...(parentRebloggedBy ? [parentRebloggedBy] : []), ...mentions].filter((id) => id !== account.id))];
};

const appendMedia = (compose: Compose, media: MediaAttachment, defaultSensitive?: boolean) => {
  const prevSize = compose.mediaAttachments.length;

  compose.mediaAttachments.push(media);
  compose.isUploading = false;
  compose.resetFileKey = Math.floor((Math.random() * 0x10000));
  compose.idempotencyKey = crypto.randomUUID();

  if (prevSize === 0 && (defaultSensitive || compose.sensitive)) {
    compose.sensitive = true;
  }
};

const removeMedia = (compose: Compose, mediaId: string) => {
  const prevSize = compose.mediaAttachments.length;

  compose.mediaAttachments = compose.mediaAttachments.filter(item => item.id !== mediaId);
  compose.idempotencyKey = crypto.randomUUID();

  if (prevSize === 1) {
    compose.sensitive = false;
  }
};

const insertSuggestion = (compose: Compose, position: number, token: string | null, completion: string, path: ComposeSuggestionSelectAction['path']) => {
  const updateText = (oldText?: string) => `${oldText?.slice(0, position)}${completion} ${oldText?.slice(position + (token?.length ?? 0))}`;
  if (path[0] === 'spoiler_text') {
    compose.spoilerText = updateText(compose.spoilerText);
  } else if (compose.poll) {
    compose.poll.options[path[2]] = updateText(compose.poll.options[path[2]]);
  }
  compose.suggestions = [];
  compose.idempotencyKey = crypto.randomUUID();
};

const updateSuggestionTags = (compose: Compose, token: string, tags: Tag[]) => {
  const prefix = token.slice(1);

  compose.suggestions = tags
    .filter((tag) => tag.name.toLowerCase().startsWith(prefix.toLowerCase()))
    .slice(0, 4)
    .map((tag) => '#' + tag.name);
};

const privacyPreference = (a: string, b: string, list_id: number | null, conversationScope = false) => {
  if (['private', 'subscribers'].includes(a) && conversationScope) return 'conversation';

  const order = ['public', 'unlisted', 'mutuals_only', 'private', 'direct', 'local'];

  if (a === 'group') return a;
  if (a === 'list' && list_id !== null) return `list:${list_id}`;

  return order[Math.max(order.indexOf(a), order.indexOf(b), 0)];
};

const domParser = new DOMParser();

const expandMentions = (status: Pick<Status, 'content' | 'mentions'>) => {
  const fragment = domParser.parseFromString(status.content, 'text/html').documentElement;

  status.mentions.forEach((mention) => {
    const node = fragment.querySelector(`a[href="${mention.url}"]`);
    if (node) node.textContent = `@${mention.acct}`;
  });

  return fragment.innerHTML;
};

const getExplicitMentions = (me: string, status: Pick<Status, 'content' | 'mentions'>) => {
  const fragment = domParser.parseFromString(status.content, 'text/html').documentElement;

  const mentions = status
    .mentions
    .filter((mention) => !(fragment.querySelector(`a[href="${mention.url}"]`) || mention.id === me))
    .map((m) => m.acct);

  return [...new Set(mentions)];
};

const importAccount = (compose: Compose, account: CredentialAccount) => {
  const settings = account.settings_store?.[FE_NAME];

  if (!settings) return;

  if (settings.defaultPrivacy) compose.visibility = settings.defaultPrivacy;
  if (settings.defaultContentType) compose.contentType = settings.defaultContentType;
};

// const updateSetting = (compose: Compose, path: string[], value: string) => {
//   const pathString = path.join(',');
//   switch (pathString) {
//     case 'defaultPrivacy':
//       return compose.set('privacy', value);
//     case 'defaultContentType':
//       return compose.set('content_type', value);
//     default:
//       return compose;
//   }
// };

const updateDefaultContentType = (compose: Compose, instance: Instance) => {
  const postFormats = instance.pleroma.metadata.post_formats;

  compose.contentType = postFormats.includes(compose.contentType) || (postFormats.includes('text/markdown') && compose.contentType === 'wysiwyg')
    ? compose.contentType
    : postFormats.includes('text/markdown')
      ? 'text/markdown'
      : postFormats[0];
};

const updateCompose = (state: State, key: string, updater: (compose: Compose) => void) =>
  create(state, draft => {
    draft[key] = draft[key] || create(draft.default, (draft) => {
      draft.idempotencyKey = crypto.randomUUID();
    });
    updater(draft[key]);
  });
  // state.update(key, state.get('default')!, updater);

const initialState: State = {
  default: newCompose({ idempotencyKey: crypto.randomUUID(), resetFileKey: getResetFileKey() }),
};

const compose = (state = initialState, action: ComposeAction | EventsAction | InstanceAction | MeAction | TimelineAction): State => {
  switch (action.type) {
    case COMPOSE_TYPE_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.contentType = action.value;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_SPOILERNESS_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.sensitive = !compose.sensitive;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_SPOILER_TEXT_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        if (!compose.modifiedLanguage || compose.modifiedLanguage === compose.language) {
          compose.spoilerText = action.text;
        } else if (compose.modifiedLanguage) {
          compose.spoilerTextMap[compose.modifiedLanguage] = action.text;
        }
      });
    case COMPOSE_VISIBILITY_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.visibility = action.value;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_LANGUAGE_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.language = action.value;
        compose.modifiedLanguage = action.value;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_MODIFIED_LANGUAGE_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.modifiedLanguage = action.value;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.text = action.text;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_REPLY:
      return updateCompose(state, action.composeId, compose => {
        const defaultCompose = state.default!;

        const mentions = action.explicitAddressing
          ? statusToMentionsArray(action.status, action.account, action.rebloggedBy)
          : [];

        compose.groupId = action.status.group_id;
        compose.inReplyToId = action.status.id;
        compose.to = mentions;
        compose.parentRebloggedById = action.rebloggedBy?.id || null;
        compose.text = !action.explicitAddressing ? statusToTextMentions(action.status, action.account) : '';
        compose.visibility = privacyPreference(action.status.visibility, defaultCompose.visibility, action.status.list_id, action.conversationScope);
        compose.local_only = action.status.local_only === true;
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
        compose.contentType = defaultCompose.contentType;
        compose.approvalRequired = action.approvalRequired || false;
        if (action.preserveSpoilers && action.status.spoiler_text) {
          compose.sensitive = true;
          compose.spoilerText = action.status.spoiler_text;
        }
      });
    case COMPOSE_EVENT_REPLY:
      return updateCompose(state, action.composeId, compose => {
        compose.inReplyToId = action.status.id;
        compose.to = statusToMentionsArray(action.status, action.account);
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_QUOTE:
      return updateCompose(state, 'compose-modal', compose => {
        const author = action.status.account.acct;
        const defaultCompose = state.default;

        compose.quote = action.status.id;
        compose.to = [author];
        compose.parentRebloggedById = null;
        compose.text = '';
        compose.visibility = privacyPreference(action.status.visibility, defaultCompose.visibility, action.status.list_id);
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
        compose.contentType = defaultCompose.contentType;
        compose.spoilerText = '';

        if (action.status.visibility === 'group') {
          compose.groupId = action.status.group_id;
          compose.visibility = 'group';
        }
      });
    case COMPOSE_SUBMIT_REQUEST:
      return updateCompose(state, action.composeId, compose => {
        compose.isSubmitting = true;
      });
    case COMPOSE_UPLOAD_CHANGE_REQUEST:
      return updateCompose(state, action.composeId, compose => {
        compose.isChangingUpload = true;
      });
    case COMPOSE_REPLY_CANCEL:
    case COMPOSE_RESET:
    case COMPOSE_SUBMIT_SUCCESS:
      return create(state, (draft) => {
        draft[action.composeId] = create(state.default, (draft) => ({
          ...draft,
          idempotencyKey: crypto.randomUUID(),
          in_reply_to_id: action.composeId.startsWith('reply:') ? action.composeId.slice(6) : null,
          ...(action.composeId.startsWith('group:') ? {
            visibility: 'group',
            group_id: action.composeId.slice(6),
          } : undefined),
        }));
      });
    case COMPOSE_SUBMIT_FAIL:
      return updateCompose(state, action.composeId, compose => {
        compose.isSubmitting = false;
      });
    case COMPOSE_UPLOAD_CHANGE_FAIL:
      return updateCompose(state, action.composeId, compose => {
        compose.isChangingUpload = false;
      });
    case COMPOSE_UPLOAD_REQUEST:
      return updateCompose(state, action.composeId, compose => {
        compose.isUploading = true;
      });
    case COMPOSE_UPLOAD_SUCCESS:
      return updateCompose(state, action.composeId, compose => appendMedia(compose, action.media, state.default.sensitive));
    case COMPOSE_UPLOAD_FAIL:
      return updateCompose(state, action.composeId, compose => {
        compose.isUploading = false;
      });
    case COMPOSE_UPLOAD_UNDO:
      return updateCompose(state, action.composeId, compose => removeMedia(compose, action.mediaId));
    case COMPOSE_UPLOAD_PROGRESS:
      return updateCompose(state, action.composeId, compose => {
        compose.progress = Math.round((action.loaded / action.total) * 100);
      });
    case COMPOSE_MENTION:
      return updateCompose(state, 'compose-modal', compose => {
        compose.text = [compose.text.trim(), `@${action.account.acct} `].filter((str) => str.length !== 0).join(' ');
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_DIRECT:
      return updateCompose(state, 'compose-modal', compose => {
        compose.text = [compose.text.trim(), `@${action.account.acct} `].filter((str) => str.length !== 0).join(' ');
        compose.visibility = 'direct';
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_GROUP_POST:
      return updateCompose(state, action.composeId, compose => {
        compose.visibility = 'group';
        compose.groupId = action.groupId;
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
      });
    case COMPOSE_SUGGESTIONS_CLEAR:
      return updateCompose(state, action.composeId, compose => {
        compose.suggestions = [];
      });
    case COMPOSE_SUGGESTIONS_READY:
      return updateCompose(state, action.composeId, compose => {
        compose.suggestions = action.accounts ? action.accounts.map((item) => item.id) : action.emojis || [];
      });
    case COMPOSE_SUGGESTION_SELECT:
      return updateCompose(state, action.composeId, compose => insertSuggestion(compose, action.position, action.token, action.completion, action.path));
    case COMPOSE_SUGGESTION_TAGS_UPDATE:
      return updateCompose(state, action.composeId, compose => updateSuggestionTags(compose, action.token, action.tags));
    case TIMELINE_DELETE:
      return updateCompose(state, 'compose-modal', compose => {
        if (action.statusId === compose.inReplyToId) {
          compose.inReplyToId = null;
        } if (action.statusId === compose.quote) {
          compose.quote = null;
        }
      });
    case COMPOSE_UPLOAD_CHANGE_SUCCESS:
      return updateCompose(state, action.composeId, compose => {
        compose.isChangingUpload = false;

        compose.mediaAttachments = compose.mediaAttachments.map(item => {
          if (item.id === action.media.id) {
            return action.media;
          }

          return item;
        });
      });
    case COMPOSE_SET_STATUS:
      return updateCompose(state, 'compose-modal', compose => {
        const mentions = action.explicitAddressing ? getExplicitMentions(action.status.account.id, action.status) : [];
        if (!action.withRedraft && !action.draftId) {
          compose.id = action.status.id;
        }
        compose.text = action.rawText || unescapeHTML(expandMentions(action.status));
        compose.to = mentions;
        compose.parentRebloggedById = null;
        compose.inReplyToId = action.status.in_reply_to_id;
        compose.visibility = action.status.visibility;
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
        const contentType = action.contentType === 'text/markdown' && state.default.contentType === 'wysiwyg'
          ? 'wysiwyg'
          : action.contentType || 'text/plain';
        compose.contentType = contentType;
        compose.quote = action.status.quote_id;
        compose.groupId = action.status.group_id;
        compose.language = action.status.language;

        compose.mediaAttachments = action.status.media_attachments;
        compose.sensitive = action.status.sensitive;

        compose.redacting = action.redacting || false;

        if (action.status.spoiler_text.length > 0) {
          compose.spoilerText = action.status.spoiler_text;
        } else {
          compose.spoilerText = '';
        }

        if (action.poll) {
          compose.poll = newPoll({
            options: action.poll.options.map(({ title }) => title),
            multiple: action.poll.multiple,
            expires_in: 24 * 3600,
          });
        }

        if (action.draftId) {
          compose.draftId = action.draftId;
        }

        if (action.editorState) {
          compose.editorState = action.editorState;
        }
      });
    case COMPOSE_POLL_ADD:
      return updateCompose(state, action.composeId, compose => {
        compose.poll = newPoll();
      });
    case COMPOSE_POLL_REMOVE:
      return updateCompose(state, action.composeId, compose => {
        compose.poll = null;
      });
    case COMPOSE_SCHEDULE_ADD:
      return updateCompose(state, action.composeId, compose => {
        compose.scheduledAt = new Date(Date.now() + 10 * 60 * 1000);
      });
    case COMPOSE_SCHEDULE_SET:
      return updateCompose(state, action.composeId, compose => {
        compose.scheduledAt = action.date;
      });
    case COMPOSE_SCHEDULE_REMOVE:
      return updateCompose(state, action.composeId, compose => {
        compose.scheduledAt = null;
      });
    case COMPOSE_POLL_OPTION_ADD:
      return updateCompose(state, action.composeId, compose => {
        if (!compose.poll) return;
        compose.poll.options.push(action.title);
        compose.poll.options_map.push(Object.fromEntries(Object.entries(compose.textMap).map((key) => [key, action.title])));
      });
    case COMPOSE_POLL_OPTION_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        if (!compose.poll) return;
        if (!compose.modifiedLanguage || compose.modifiedLanguage === compose.language) {
          compose.poll.options[action.index] = action.title;
          if (compose.modifiedLanguage) compose.poll.options_map[action.index][compose.modifiedLanguage] = action.title;
        }
      });
    case COMPOSE_POLL_OPTION_REMOVE:
      return updateCompose(state, action.composeId, compose => {
        if (!compose.poll) return;
        compose.poll.options = compose.poll.options.filter((_, index) => index !== action.index);
        compose.poll.options_map = compose.poll.options_map.filter((_, index) => index !== action.index);
      });
    case COMPOSE_POLL_SETTINGS_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        if (!compose.poll) return null;
        if (action.expiresIn) {
          compose.poll.expires_in = action.expiresIn;
        }
        if (typeof action.isMultiple === 'boolean') {
          compose.poll.multiple = action.isMultiple;
        }
      });
    case COMPOSE_ADD_TO_MENTIONS:
      return updateCompose(state, action.composeId, compose => {
        compose.to = [...new Set([...compose.to, action.account])];
      });
    case COMPOSE_REMOVE_FROM_MENTIONS:
      return updateCompose(state, action.composeId, compose => {
        compose.to = compose.to.filter(acct => acct !== action.account);
      });
    case ME_FETCH_SUCCESS:
    case ME_PATCH_SUCCESS:
      return updateCompose(state, 'default', compose => importAccount(compose, action.me));
      // case SETTING_CHANGE:
      //   return updateCompose(state, 'default', compose => updateSetting(compose, action.path, action.value));
    case COMPOSE_EDITOR_STATE_SET:
      return updateCompose(state, action.composeId, compose => {
        if (!compose.modifiedLanguage || compose.modifiedLanguage === compose.language) {
          compose.editorState = action.editorState as string;
          compose.text = action.text as string;
        } else if (compose.modifiedLanguage) {
          compose.editorStateMap[compose.modifiedLanguage] = action.editorState as string;
          compose.textMap[compose.modifiedLanguage] = action.text as string;
        }
      });
    case EVENT_COMPOSE_CANCEL:
      return updateCompose(state, 'event-compose-modal', compose => {
        compose.text = '';
      });
    case EVENT_FORM_SET:
      return updateCompose(state, action.composeId, compose => {
        compose.text = action.text;
      });
    case COMPOSE_CHANGE_MEDIA_ORDER:
      return updateCompose(state, action.composeId, compose => {
        const indexA = compose.mediaAttachments.findIndex(x => x.id === action.a);
        const indexB = compose.mediaAttachments.findIndex(x => x.id === action.b);

        const item = compose.mediaAttachments.splice(indexA, 1)[0];
        compose.mediaAttachments.splice(indexB, 0, item);
      });
    case COMPOSE_ADD_SUGGESTED_QUOTE:
      return updateCompose(state, action.composeId, compose => {
        compose.quote = action.quoteId;
      });
    case COMPOSE_ADD_SUGGESTED_LANGUAGE:
      return updateCompose(state, action.composeId, compose => {
        compose.suggestedLanguage = action.language;
      });
    case COMPOSE_LANGUAGE_ADD:
      return updateCompose(state, action.composeId, compose => {
        compose.editorStateMap[action.value] = compose.editorState;
        compose.textMap[action.value] = compose.text;
        compose.spoilerTextMap[action.value] = compose.spoilerText;
        if (compose.poll) compose.poll.options_map.forEach((option, key) => option[action.value] = compose.poll!.options[key]);
      });
    case COMPOSE_LANGUAGE_DELETE:
      return updateCompose(state, action.composeId, compose => {
        delete compose.editorStateMap[action.value];
        delete compose.textMap[action.value];
        delete compose.spoilerTextMap[action.value];
      });
    case COMPOSE_QUOTE_CANCEL:
      return updateCompose(state, action.composeId, (compose) => {
        if (compose.quote) compose.dismissedQuotes.push(compose.quote);
        compose.quote = null;
      });
    case COMPOSE_FEDERATED_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.local_only = !compose.local_only;
      });
    case COMPOSE_INTERACTION_POLICY_OPTION_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        if (compose.interactionPolicy === null) compose.interactionPolicy = JSON.parse(JSON.stringify(action.initial))!;

        compose.interactionPolicy = create(compose.interactionPolicy || action.initial, (interactionPolicy) => {
          interactionPolicy[action.policy][action.rule] = action.value;
          interactionPolicy[action.policy][action.rule === 'always' ? 'with_approval' : 'always'] = interactionPolicy[action.policy][action.rule === 'always' ? 'with_approval' : 'always'].filter(rule => !action.value.includes(rule as any));
        });
      });
    case INSTANCE_FETCH_SUCCESS:
      return updateCompose(state, 'default', (compose) => updateDefaultContentType(compose, action.instance));
    case COMPOSE_CLEAR_LINK_SUGGESTION_CREATE:
      return updateCompose(state, action.composeId, compose => {
        compose.clearLinkSuggestion = action.suggestion;
      });
    case COMPOSE_CLEAR_LINK_SUGGESTION_IGNORE:
      return updateCompose(state, action.composeId, compose => {
        if (compose.clearLinkSuggestion?.key === action.key) {
          compose.clearLinkSuggestion = null;
        }
        compose.dismissedClearLinksSuggestions.push(action.key);
      });
    case COMPOSE_PREVIEW_SUCCESS:
      return updateCompose(state, action.composeId, compose => {
        compose.preview = action.status;
      });
    case COMPOSE_PREVIEW_CANCEL:
      return updateCompose(state, action.composeId, compose => {
        compose.preview = null;
      });
    case COMPOSE_HASHTAG_CASING_SUGGESTION_SET:
      return updateCompose(state, action.composeId, compose => {
        compose.hashtagCasingSuggestion = action.suggestion;
      });
    case COMPOSE_HASHTAG_CASING_SUGGESTION_IGNORE:
      return updateCompose(state, action.composeId, compose => {
        compose.hashtagCasingSuggestion = null;
        compose.hashtagCasingSuggestionIgnored = true;
      });
    case COMPOSE_REDACTING_OVERWRITE_CHANGE:
      return updateCompose(state, action.composeId, compose => {
        compose.redactingOverwrite = action.value;
      });
    default:
      return state;
  }
};

export {
  type Compose,
  type ClearLinkSuggestion,
  statusToMentionsAccountIdsArray,
  initialState,
  compose as default,
};
