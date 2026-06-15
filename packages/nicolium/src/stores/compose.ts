import { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { uploadFile, updateMedia } from '@/actions/media';
import { saveSettings } from '@/actions/settings';
import { createStatus } from '@/actions/statuses';
import { isNativeEmoji } from '@/features/emoji';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { selectAccount } from '@/queries/accounts/selectors';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { cancelDraftStatus } from '@/queries/statuses/use-draft-statuses';
import { router } from '@/router';
import { isLoggedIn, getClient, getOwnAccount } from '@/stores/auth';
import { useInstance } from '@/stores/instance';
import { useModalsActions, useModalsStore } from '@/stores/modals';
import { useSettings, useSettingsStore } from '@/stores/settings';
import toast from '@/toast';
import { userTouching } from '@/utils/is-mobile';

import { useUiStoreActions } from './ui';

import type { AutoSuggestion } from '@/components/autosuggest-input';
import type { Language } from '@/pages/settings/components/preferences';
import type { NormalizedStatus as Status } from '@/queries/statuses/normalize';
import type { LinkOptions } from '@tanstack/react-router';
import type {
  Account,
  CreateStatusParams,
  Group,
  MediaAttachment,
  Status as BaseStatus,
  Poll,
  InteractionPolicy,
  UpdateMediaParams,
  Location,
  EditStatusParams,
  StatusSource,
} from 'pl-api';

const messages = defineMessages({
  scheduleError: {
    id: 'compose.invalid_schedule',
    defaultMessage: 'You must schedule a post at least 5 minutes out.',
  },
  success: { id: 'compose.submit.success', defaultMessage: 'Your post was sent!' },
  editSuccess: { id: 'compose.edit.success', defaultMessage: 'Your post was edited' },
  redactSuccess: { id: 'compose.redact.success', defaultMessage: 'The post was redacted' },
  scheduledSuccess: { id: 'compose.scheduled.success', defaultMessage: 'Your post was scheduled' },
  uploadErrorLimit: { id: 'upload_error.limit', defaultMessage: 'File upload limit exceeded.' },
  uploadErrorPoll: {
    id: 'upload_error.poll',
    defaultMessage: 'File upload not allowed with polls.',
  },
  view: { id: 'toast.view', defaultMessage: 'View' },
  replyConfirm: { id: 'confirmations.reply.confirm', defaultMessage: 'Reply' },
  replyMessage: {
    id: 'confirmations.reply.message',
    defaultMessage:
      'Replying now will overwrite the message you are currently composing. Are you sure you want to proceed?',
  },
  submitError: { id: 'compose.submit.fail', defaultMessage: 'Failed to submit your post' },
});

const getResetFileKey = () => Math.floor(Math.random() * 0x10000);

type ComposePageSearch = {
  approvalRequired?: boolean;
  draftId?: string;
  inReplyTo?: string;
  quote?: string;
  text?: string;
  visibility?: 'public' | 'unlisted' | 'private' | 'direct';
};

interface ComposePoll {
  options: Array<string>;
  options_map: Array<Record<Language | string, string>>;
  expires_in: number;
  multiple: boolean;
  hide_totals: boolean;
}

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
  location: Location | null;

  // Post settings
  contentType: string;
  interactionPolicy: InteractionPolicy | null;
  quoteApprovalPolicy: CreateStatusParams['quote_approval_policy'] | null;
  language: Language | string | null;
  localOnly: boolean;
  scheduledAt: Date | null;
  sensitive: boolean;
  visibility: string;

  // References to other posts/groups/users
  draftId: string | null;
  groupId: string | null;
  editedId: string | null;
  inReplyToId: string | null;
  quoteId: string | null;
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
  previewAutoUpdate: boolean;
  suggestedLanguage: string | null;
  showLocationPicker: boolean;

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
  location: null,

  contentType: 'default', // 'text/plain',
  interactionPolicy: null,
  quoteApprovalPolicy: null,
  language: null,
  localOnly: false,
  scheduledAt: null,
  sensitive: false,
  visibility: 'default', // 'public',

  draftId: null,
  groupId: null,
  editedId: null,
  inReplyToId: null,
  quoteId: null,
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
  previewAutoUpdate: false,
  suggestedLanguage: null,
  showLocationPicker: false,

  redacting: false,
  redactingOverwrite: false,

  ...params,
});

const newPoll = (params: Partial<ComposePoll> = {}): ComposePoll => ({
  options: ['', ''],
  options_map: [{}, {}],
  expires_in: 24 * 3600,
  multiple: false,
  hide_totals: false,
  ...params,
});

const statusToTextMentions = (
  status: Pick<Status, 'account_id' | 'mentions'>,
  account: Pick<Account, 'acct'>,
) => {
  const statusAccount = selectAccount(status.account_id);
  const author = statusAccount?.acct;
  const mentions = status.mentions.map((m) => m.acct);

  return [...new Set([author, ...mentions].filter((acct) => acct && acct !== account.acct))]
    .map((m) => `@${m} `)
    .join('');
};

const statusToMentionsArray = (
  status: Pick<Status, 'account_id' | 'mentions'>,
  account: Pick<Account, 'acct'>,
  rebloggedBy?: Pick<Account, 'acct'>,
) => {
  const statusAccount = selectAccount(status.account_id);
  const author = statusAccount?.acct;
  const mentions = status.mentions.map((m) => m.acct);

  return [
    ...new Set(
      [author, ...(rebloggedBy ? [rebloggedBy.acct] : []), ...mentions].filter(
        (acct): acct is string => !!acct && acct !== account.acct,
      ),
    ),
  ];
};

const statusToMentionsAccountIdsArray = (
  status: Pick<Status, 'mentions' | 'account_id'>,
  account: Pick<Account, 'id'>,
  parentRebloggedBy?: string | null,
) => {
  const mentions = status.mentions.map((m) => m.id);

  return [
    ...new Set(
      [status.account_id, ...(parentRebloggedBy ? [parentRebloggedBy] : []), ...mentions].filter(
        (id) => id !== account.id,
      ),
    ),
  ];
};

const privacyPreference = (
  a: string,
  b: string,
  list_id: number | null,
  conversationScope = false,
) => {
  if (['private', 'subscribers'].includes(a) && conversationScope) return 'conversation';

  const order = ['public', 'unlisted', 'mutuals_only', 'private', 'direct', 'local'];

  if (a === 'group') return a;
  if (a === 'list' && list_id !== null) return `list:${list_id}`;

  return order[Math.max(order.indexOf(a), order.indexOf(b), 0)];
};

const domParser = new DOMParser();

const getExplicitMentions = (me: string, status: Pick<Status, 'content' | 'mentions'>) => {
  const fragment = domParser.parseFromString(status.content, 'text/html').documentElement;

  const mentions = status.mentions
    .filter((mention) => !(fragment.querySelector(`a[href="${mention.url}"]`) ?? mention.id === me))
    .map((m) => m.acct);

  return [...new Set(mentions)];
};

const appendMedia = (compose: Compose, media: MediaAttachment) => {
  const prevSize = compose.mediaAttachments.length;

  compose.mediaAttachments.push(media);
  compose.isUploading = false;
  compose.resetFileKey = Math.floor(Math.random() * 0x10000);

  if (prevSize === 0 && compose.sensitive) {
    compose.sensitive = true;
  }
};

const openDedicatedComposeWindow = (search?: ComposePageSearch) =>
  window.open(
    router.buildLocation({ search: search ?? {}, to: '/statuses/new' }).href,
    'targetWindow',
    'height=500,width=700',
  );

const openComposeSurface = (search?: ComposePageSearch, modalProps?: { composeId?: string }) => {
  const { useDedicatedComposePage } = useSettingsStore.getState().settings;

  if (useDedicatedComposePage && !userTouching.matches && !modalProps?.composeId) {
    openDedicatedComposeWindow(search);
    return;
  }

  useModalsStore.getState().actions.openModal('COMPOSE', modalProps);
};

interface ComposeState {
  default: Compose;
  composers: Record<string, Compose>;
}

interface ComposeActions {
  updateCompose: (composeId: string, updater: (draft: Compose) => void) => void;
  updateAllCompose: (updater: (draft: Compose) => void) => void;
  getCompose: (composeId: string) => Compose;

  setComposeToStatus: (
    status: Pick<
      Status,
      | 'id'
      | 'account_id'
      | 'content'
      | 'group_id'
      | 'in_reply_to_id'
      | 'language'
      | 'media_attachments'
      | 'mentions'
      | 'quote_id'
      | 'sensitive'
      | 'spoiler_text'
      | 'visibility'
    >,
    poll: Poll | null | undefined,
    source: Omit<StatusSource, 'id'>,
    withRedraft?: boolean,
    draftId?: string | null,
    editorState?: string | null,
    redacting?: boolean,
  ) => void;
  replyCompose: (
    status: Pick<
      Status,
      | 'id'
      | 'account_id'
      | 'group_id'
      | 'list_id'
      | 'local_only'
      | 'mentions'
      | 'spoiler_text'
      | 'visibility'
    >,
    rebloggedBy?: Pick<Account, 'acct' | 'id'>,
    approvalRequired?: boolean,
    openComposer?: boolean,
  ) => void;
  quoteCompose: (
    status: Pick<Status, 'id' | 'account_id' | 'visibility' | 'group_id' | 'list_id'>,
    approvalRequired?: boolean,
    openComposer?: boolean,
  ) => void;
  mentionCompose: (account: Pick<Account, 'acct'>) => void;
  directCompose: (account: Pick<Account, 'acct'>) => void;
  groupComposeModal: (group: Pick<Group, 'id'>) => void;
  openComposeWithText: (composeId: string, text?: string) => void;
  eventDiscussionCompose: (
    composeId: string,
    status: Pick<Status, 'id' | 'account_id' | 'mentions'>,
  ) => void;
  resetCompose: (composeId?: string) => void;
  selectComposeSuggestion: (
    composeId: string,
    position: number,
    token: string | null,
    suggestion: AutoSuggestion,
    path: ['spoiler_text'] | ['poll', 'options', number],
  ) => void;

  handleTimelineDelete: (statusId: string) => void;
}

type ComposeStore = ComposeState & { actions: ComposeActions };

const useComposeStore = create<ComposeStore>()(
  mutative(
    (set, get) => ({
      default: newCompose({ idempotencyKey: crypto.randomUUID(), resetFileKey: getResetFileKey() }),
      composers: {},

      actions: {
        updateCompose: (composeId, updater) => {
          set((state) => {
            if (!state.composers[composeId]) {
              state.composers[composeId] = {
                ...state.default,
                idempotencyKey: crypto.randomUUID(),
              };
            }
            updater(state.composers[composeId]);
          });
        },

        updateAllCompose: (updater) => {
          set((state) => {
            Object.values(state.composers).forEach((compose) => {
              updater(compose);
            });
          });
        },

        getCompose: (composeId) => get().composers[composeId] ?? get().default,

        setComposeToStatus: (
          status,
          poll,
          source,
          withRedraft = false,
          draftId = null,
          editorState = null,
          redacting = false,
        ) => {
          const { features } = getClient();
          const explicitAddressing =
            features.createStatusExplicitAddressing &&
            !useSettingsStore.getState().settings.forceImplicitAddressing;

          set((state) => {
            state.composers['compose-modal'] = {
              ...state.default,
              idempotencyKey: crypto.randomUUID(),
            };

            const compose = state.composers['compose-modal'];
            const mentions = explicitAddressing
              ? getExplicitMentions(status.account_id, status)
              : [];
            if (!withRedraft && !draftId) {
              compose.editedId = status.id;
            }
            compose.text = source.text;
            compose.textMap = source.text_map ?? {};
            compose.to = mentions;
            compose.parentRebloggedById = null;
            compose.inReplyToId = status.in_reply_to_id;
            compose.visibility = status.visibility;
            compose.caretPosition = null;
            const contentType =
              source.content_type === 'text/markdown' && state.default.contentType === 'wysiwyg'
                ? 'wysiwyg'
                : source.content_type || 'text/plain';
            compose.contentType = contentType;
            compose.quoteId = status.quote_id;
            compose.groupId = status.group_id;
            compose.language = status.language;

            compose.mediaAttachments = status.media_attachments;
            compose.sensitive = status.sensitive;

            compose.redacting = redacting ?? false;

            compose.spoilerText = source.spoiler_text;
            compose.spoilerTextMap = source.spoiler_text_map ?? {};

            if (poll) {
              compose.poll = newPoll({
                options: poll.options.map(({ title }) => title),
                multiple: poll.multiple,
                expires_in: 24 * 3600,
              });
            }

            if (draftId) {
              compose.draftId = draftId;
            }

            if (editorState) {
              compose.editorState = editorState;
            }
          });
        },

        replyCompose: (status, rebloggedBy, approvalRequired, openComposer = true) => {
          const { features } = getClient();
          const { forceImplicitAddressing, preserveSpoilers } =
            useSettingsStore.getState().settings;
          const explicitAddressing =
            features.createStatusExplicitAddressing && !forceImplicitAddressing;
          const account = getOwnAccount();

          if (!account) return;

          set((draft) => {
            if (!draft.composers['compose-modal']) {
              draft.composers['compose-modal'] = {
                ...draft.default,
                idempotencyKey: crypto.randomUUID(),
              };
            }
            const compose = draft.composers['compose-modal'];

            const mentions = explicitAddressing
              ? statusToMentionsArray(status, account, rebloggedBy)
              : [];

            compose.groupId = status.group_id;
            compose.inReplyToId = status.id;
            compose.to = mentions;
            compose.parentRebloggedById = rebloggedBy?.id ?? null;
            compose.text = !explicitAddressing ? statusToTextMentions(status, account) : '';
            compose.visibility = privacyPreference(
              status.visibility,
              draft.default.visibility,
              status.list_id,
              features.createStatusConversationScope,
            );
            compose.localOnly = status.local_only === true;
            compose.caretPosition = null;
            compose.contentType = draft.default.contentType;
            compose.approvalRequired = approvalRequired ?? false;
            if (preserveSpoilers && status.spoiler_text) {
              compose.sensitive = true;
              compose.spoilerText = status.spoiler_text;
            }
          });

          if (openComposer) {
            openComposeSurface({
              approvalRequired,
              inReplyTo: status.id,
            });
          }
        },

        quoteCompose: (status, approvalRequired, openComposer = true) => {
          set((draft) => {
            if (!draft.composers['compose-modal']) {
              draft.composers['compose-modal'] = {
                ...draft.default,
                idempotencyKey: crypto.randomUUID(),
              };
            }
            const compose = draft.composers['compose-modal'];

            const statusAccount = selectAccount(status.account_id);
            const author = statusAccount?.acct ?? '';

            compose.quoteId = status.id;
            compose.to = [author];
            compose.parentRebloggedById = null;
            compose.text = '';
            compose.visibility = privacyPreference(
              status.visibility,
              draft.default.visibility,
              status.list_id,
            );
            compose.caretPosition = null;
            compose.contentType = draft.default.contentType;
            compose.spoilerText = '';
            compose.approvalRequired = approvalRequired ?? false;

            if (status.visibility === 'group') {
              compose.groupId = status.group_id;
              compose.visibility = 'group';
            }
          });

          if (openComposer) {
            openComposeSurface({
              approvalRequired,
              quote: status.id,
            });
          }
        },

        mentionCompose: (account) => {
          if (!isLoggedIn()) return;

          if (
            useSettingsStore.getState().settings.useDedicatedComposePage &&
            !userTouching.matches
          ) {
            openDedicatedComposeWindow({ text: `@${account.acct} ` });
            return;
          }

          get().actions.updateCompose('compose-modal', (compose) => {
            compose.text = [compose.text.trim(), `@${account.acct} `]
              .filter((str) => str.length !== 0)
              .join(' ');
            compose.caretPosition = null;
          });
          openComposeSurface();
        },

        directCompose: (account) => {
          if (
            useSettingsStore.getState().settings.useDedicatedComposePage &&
            !userTouching.matches
          ) {
            openDedicatedComposeWindow({
              text: `@${account.acct} `,
              visibility: 'direct',
            });
            return;
          }

          get().actions.updateCompose('compose-modal', (compose) => {
            compose.text = [compose.text.trim(), `@${account.acct} `]
              .filter((str) => str.length !== 0)
              .join(' ');
            compose.visibility = 'direct';
            compose.caretPosition = null;
          });
          openComposeSurface();
        },

        groupComposeModal: (group) => {
          const composeId = `group:${group.id}`;
          get().actions.updateCompose(composeId, (draft) => {
            draft.visibility = 'group';
            draft.groupId = group.id;
            draft.caretPosition = null;
          });
          useModalsStore.getState().actions.openModal('COMPOSE', { composeId });
        },

        openComposeWithText: (composeId, text = '') => {
          set((state) => {
            state.composers[composeId] = {
              ...state.default,
              idempotencyKey: crypto.randomUUID(),
              resetFileKey: getResetFileKey(),
              ...(composeId.startsWith('reply:') ? { inReplyToId: composeId.slice(6) } : undefined),
              ...(composeId.startsWith('group:')
                ? { visibility: 'group', groupId: composeId.slice(6) }
                : undefined),
              text,
            };
          });
          openComposeSurface({ text });
        },

        eventDiscussionCompose: (composeId, status) => {
          const account = getOwnAccount();

          if (!account) return;

          get().actions.updateCompose(composeId, (compose) => {
            compose.inReplyToId = status.id;
            compose.to = statusToMentionsArray(status, account);
          });
        },

        resetCompose: (composeId = 'compose-modal') => {
          set((state) => {
            state.composers[composeId] = {
              ...state.default,
              idempotencyKey: crypto.randomUUID(),
              resetFileKey: getResetFileKey(),
              ...(composeId.startsWith('reply:') ? { inReplyToId: composeId.slice(6) } : undefined),
              ...(composeId.startsWith('group:')
                ? { visibility: 'group', groupId: composeId.slice(6) }
                : undefined),
            };
          });
        },

        selectComposeSuggestion: (composeId, startPosition, token, suggestion, path) => {
          let completion = '';

          if (typeof suggestion === 'object' && 'id' in suggestion) {
            completion = isNativeEmoji(suggestion) ? suggestion.native : suggestion.colons;

            useSettingsStore.getState().actions.rememberEmojiUse(suggestion);
            saveSettings();
          } else if (typeof suggestion === 'string' && suggestion[0] === '#') {
            completion = suggestion;
          } else if (typeof suggestion === 'string') {
            completion = selectAccount(suggestion)!.acct;
          }

          get().actions.updateCompose(composeId, (compose) => {
            const updateText = (oldText?: string) =>
              `${oldText?.slice(0, startPosition)}${completion} ${oldText?.slice(startPosition + (token?.length ?? 0))}`;
            if (path[0] === 'spoiler_text') {
              compose.spoilerText = updateText(compose.spoilerText);
            } else if (compose.poll) {
              compose.poll.options[path[2]] = updateText(compose.poll.options[path[2]]);
            }
          });
        },

        handleTimelineDelete: (statusId) => {
          get().actions.updateAllCompose((compose) => {
            if (statusId === compose.inReplyToId) {
              compose.inReplyToId = null;
            }
            if (statusId === compose.quoteId) {
              compose.quoteId = null;
            }
          });
        },
      },
    }),
    {
      enableAutoFreeze: false,
    },
  ),
);

const useSubmitCompose = (composeId: string) => {
  const actions = useComposeActions();
  const client = useClient();
  const { data: ownAccount } = useOwnAccount();
  const features = useFeatures();
  const { openModal, closeModal } = useModalsActions();
  const { removeSledzik } = useUiStoreActions();
  const settings = useSettings();
  const instance = useInstance();

  const submitCompose = useCallback(
    async (
      opts: {
        force?: boolean;
        preview?: boolean;
        onSuccess?: () => void;
        propagate?: boolean;
      } = {},
    ) => {
      const { force = false, preview = false, onSuccess, propagate = false } = opts;

      const compose = actions.getCompose(composeId);

      const { defaultContentType } = useSettingsStore.getState().settings;

      let contentType = getComposeContentType(
        compose.contentType,
        defaultContentType,
        instance.pleroma.metadata.post_formats,
      );

      if (preview && contentType === 'text/x.misskeymarkdown') {
        const data: Partial<Status> = {
          text: compose.text,
          content: compose.text,
          spoiler_text: compose.spoilerText,
          media_attachments: compose.mediaAttachments,
          content_type: 'text/x.misskeymarkdown',
          emojis: [],
        };
        actions.updateCompose(composeId, (draft) => {
          draft.preview = data;
        });
        onSuccess?.();
        return;
      }

      const statusText = compose.text;
      const media = compose.mediaAttachments;
      const editedId = compose.editedId;
      let to = compose.to;
      const { forceImplicitAddressing } = settings;
      const explicitAddressing =
        features.createStatusExplicitAddressing && !forceImplicitAddressing;

      if (!preview) {
        const scheduledAt = compose.scheduledAt;
        if (scheduledAt) {
          const fiveMinutesFromNow = new Date(Date.now() + 300000);
          const valid =
            scheduledAt.getTime() > fiveMinutesFromNow.getTime() ||
            (features.scheduledStatusesBackwards && scheduledAt.getTime() < Date.now());
          if (!valid) {
            toast.error(messages.scheduleError);
            return;
          }
        }

        if ((!statusText || !statusText.length) && media.length === 0) {
          return;
        }

        if (!force) {
          const missingDescriptionModal = settings.missingDescriptionModal;
          const hasMissing = media.some((item) => !item.description);
          if (missingDescriptionModal && hasMissing) {
            openModal('MISSING_DESCRIPTION', {
              onContinue: () => {
                closeModal('MISSING_DESCRIPTION');
                submitCompose({ force: true, onSuccess, propagate });
              },
            });
            return;
          }
        }
      }

      const mentionsMatch: string[] | null = statusText.match(
        /(?:^|\s)@([a-z\d_-]+(?:@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]+)?)/gi,
      );

      if (mentionsMatch) {
        to = [
          ...new Set([
            ...to,
            ...mentionsMatch.map((mention) => mention.replaceAll('&#x20;', '').trim().slice(1)),
          ]),
        ];
      }

      if (!preview) {
        actions.updateCompose(composeId, (draft) => {
          draft.isSubmitting = true;
        });

        closeModal('COMPOSE');

        if (compose.language && !editedId) {
          useSettingsStore.getState().actions.rememberLanguageUse(compose.language);
          saveSettings();
        }
      }

      const idempotencyKey = compose.idempotencyKey;

      const { defaultPrivacy } = useSettingsStore.getState().settings;

      let visibility = compose.visibility;
      if (visibility === 'default') visibility = defaultPrivacy;

      const params: CreateStatusParams = {
        status: statusText,
        in_reply_to_id: compose.inReplyToId ?? undefined,
        quote_id: compose.quoteId ?? undefined,
        media_ids: media.map((item) => item.id),
        sensitive: compose.sensitive,
        spoiler_text: compose.spoilerText,
        visibility,
        content_type: contentType,
        scheduled_at: preview ? undefined : compose.scheduledAt?.toISOString(),
        language: compose.language ?? compose.suggestedLanguage ?? undefined,
        to: explicitAddressing && to.length ? to : undefined,
        local_only: compose.localOnly,
        interaction_policy:
          (['public', 'unlisted', 'private'].includes(compose.visibility) &&
            compose.interactionPolicy) ||
          undefined,
        quote_approval_policy: compose.quoteApprovalPolicy ?? undefined,
        location_id: compose.location?.origin_id ?? undefined,
      };

      if (compose.editedId) {
        (params as EditStatusParams).media_attributes = media.map((item) => {
          const focalPoint = (item.type === 'image' || item.type === 'gifv') && item.meta?.focus;
          const focus = focalPoint
            ? `${focalPoint.x.toFixed(2)},${focalPoint.y.toFixed(2)}`
            : undefined;

          return { id: item.id, description: item.description, focus };
        }) as EditStatusParams['media_attributes'];
      }

      if (compose.poll) {
        params.poll = {
          options: compose.poll.options,
          expires_in: compose.poll.expires_in,
          multiple: compose.poll.multiple,
          hide_totals: compose.poll.hide_totals,
          options_map: compose.poll.options_map,
        };
      }

      if (compose.language && Object.keys(compose.textMap).length) {
        params.status_map = compose.textMap;
        params.status_map[compose.language] = statusText;

        if (params.spoiler_text) {
          params.spoiler_text_map = compose.spoilerTextMap;
          params.spoiler_text_map[compose.language] = compose.spoilerText;
        }

        const pollParams = params.poll;
        if (pollParams?.options_map) {
          pollParams.options.forEach(
            (option, index: number) => (pollParams.options_map![index][compose.language!] = option),
          );
        }
      }

      if (visibility === 'group' && compose.groupId) {
        params.group_id = compose.groupId;
      }

      if (preview) {
        try {
          const data = await client.statuses.previewStatus(params);
          actions.updateCompose(composeId, (draft) => {
            draft.preview = data;
            draft.preview.id = '';
          });
          onSuccess?.();
        } catch {}
      } else {
        if (compose.redacting) {
          // @ts-expect-error
          params.overwrite = compose.redactingOverwrite;
        }

        if (!compose.preview && compose.text.trim().toLocaleUpperCase() === '5P13RD4L4J-5L3D21U') {
          removeSledzik();
        }

        try {
          const data = await createStatus(
            client,
            params,
            idempotencyKey,
            editedId,
            compose.redacting,
          );

          const draftIdToCancel = compose.draftId;

          actions.resetCompose(composeId);

          if (draftIdToCancel) {
            const accountUrl = ownAccount!.url;
            cancelDraftStatus(queryClient, accountUrl, draftIdToCancel);
          }

          if (data.scheduled_at === null) {
            const linkOptions: LinkOptions =
              data.visibility === 'direct' && features.conversations
                ? { to: '/conversations' }
                : {
                    to: '/@{$username}/posts/$statusId',
                    params: { username: data.account.acct, statusId: data.id },
                  };
            const toastMessage = compose.redacting
              ? messages.redactSuccess
              : editedId
                ? messages.editSuccess
                : messages.success;
            const toastOptions = { actionLabel: messages.view, actionLinkOptions: linkOptions };

            if (propagate) {
              toast.propagate('success', toastMessage, toastOptions);
            } else {
              toast.success(toastMessage, toastOptions);
            }
          } else {
            const toastOptions = {
              actionLabel: messages.view,
              actionLinkOptions: { to: '/scheduled_statuses' as const },
            };

            if (propagate) {
              toast.propagate('success', messages.scheduledSuccess, toastOptions);
            } else {
              toast.success(messages.scheduledSuccess, toastOptions);
            }

            queryClient.invalidateQueries({ queryKey: queryKeys.scheduledStatuses.all });
          }

          onSuccess?.();
        } catch (error) {
          const message = (error as any).response?.json?.error || messages.submitError;
          if (propagate) {
            toast.propagate('error', message);
          } else {
            toast.error(message);
          }
          actions.updateCompose(composeId, (draft) => {
            draft.isSubmitting = false;
          });
        }
      }
    },
    [composeId],
  );

  return submitCompose;
};

const useCompose = <ID extends string>(composeId: ID extends 'default' ? never : ID): Compose =>
  useComposeStore((state) => state.composers[composeId] ?? state.default);

const useComposeActions = () => useComposeStore((state) => state.actions);

const useUploadCompose = (composeId: string) => {
  const { updateCompose } = useComposeActions();
  const client = useClient();
  const instance = useInstance();
  const intl = useIntl();

  return useCallback(
    (files: FileList) => {
      const compose =
        useComposeStore.getState().composers[composeId] || useComposeStore.getState().default;

      const attachmentLimit = instance.configuration.statuses.max_media_attachments;
      const media = compose.mediaAttachments;
      const progress = new Array(files.length).fill(0);
      let total = Array.from(files).reduce((a, v) => a + v.size, 0);
      const mediaCount = media ? media.length : 0;

      if (files.length + mediaCount > attachmentLimit) {
        toast.error(messages.uploadErrorLimit);
        return;
      }

      updateCompose(composeId, (draft) => {
        draft.isUploading = true;
      });

      Array.from(files).forEach((f, i) => {
        if (mediaCount + i > attachmentLimit - 1) return;

        uploadFile(
          client,
          f,
          intl,
          (data) =>
            updateCompose(composeId, (draft) => {
              appendMedia(draft, data);
            }),
          () =>
            updateCompose(composeId, (draft) => {
              draft.isUploading = false;
            }),
          ({ loaded }) => {
            progress[i] = loaded;
            updateCompose(composeId, (draft) => {
              draft.progress = Math.round((progress.reduce((a, v) => a + v, 0) / total) * 100);
            });
          },
          (value) => {
            total += value;
          },
        );
      });
    },
    [instance, composeId],
  );
};

const useChangeUploadCompose = (composeId: string) => {
  const { updateCompose } = useComposeActions();
  const client = useClient();

  return useCallback(
    async (mediaId: string, params: UpdateMediaParams) => {
      const compose =
        useComposeStore.getState().composers[composeId] || useComposeStore.getState().default;

      updateCompose(composeId, (draft) => {
        draft.isChangingUpload = true;
      });

      try {
        const response = await updateMedia(client, mediaId, params);
        updateCompose(composeId, (draft) => {
          draft.isChangingUpload = false;
          draft.mediaAttachments = draft.mediaAttachments.map((item) =>
            item.id === response.id ? response : item,
          );
        });
        return response;
      } catch (error: any) {
        if (error.response?.status === 404 && compose.editedId) {
          const previousMedia = compose.mediaAttachments.find((m) => m.id === mediaId);
          if (previousMedia) {
            updateCompose(composeId, (draft) => {
              draft.isChangingUpload = false;
              draft.mediaAttachments = draft.mediaAttachments.map((item) =>
                item.id === mediaId ? { ...previousMedia, ...params } : item,
              );
            });
            return;
          }
        }
        updateCompose(composeId, (draft) => {
          draft.isChangingUpload = false;
        });
      }
    },
    [composeId],
  );
};

const useComposeVisibility = (composeId: string) => {
  const { visibility } = useCompose(composeId);
  const { defaultPrivacy } = useSettings();

  if (visibility === 'default') return defaultPrivacy;
  return visibility;
};

const getComposeContentType = (
  contentType: string,
  defaultContentType: string,
  postFormats: string[],
) => {
  if (contentType === 'default') {
    const resolvedContentType =
      defaultContentType === 'wysiwyg' ? 'text/markdown' : defaultContentType;
    if (postFormats.includes(resolvedContentType)) return defaultContentType;
    return postFormats[0] ?? 'text/plain';
  }

  return contentType;
};

const useComposeContentType = (composeId: string) => {
  const { contentType } = useCompose(composeId);
  const instance = useInstance();
  const postFormats = instance.pleroma.metadata.post_formats;
  const { defaultContentType } = useSettings();

  return getComposeContentType(contentType, defaultContentType, postFormats);
};

export {
  type Compose,
  appendMedia,
  newPoll,
  openDedicatedComposeWindow,
  statusToMentionsAccountIdsArray,
  useComposeStore,
  useCompose,
  useComposeActions,
  useSubmitCompose,
  useUploadCompose,
  useChangeUploadCompose,
  useComposeVisibility,
  useComposeContentType,
};
