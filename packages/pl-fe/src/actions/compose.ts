import throttle from 'lodash/throttle';
import { defineMessages, IntlShape } from 'react-intl';

import { getClient } from '@/api';
import { isNativeEmoji } from '@/features/emoji';
import emojiSearch from '@/features/emoji/search';
import { Language } from '@/features/preferences';
import { selectAccount, selectOwnAccount } from '@/queries/accounts/selectors';
import { queryClient } from '@/queries/client';
import { cancelDraftStatus } from '@/queries/statuses/use-draft-statuses';
import { useModalsStore } from '@/stores/modals';
import { useSettingsStore } from '@/stores/settings';
import toast from '@/toast';
import { isLoggedIn } from '@/utils/auth';

import { importEntities } from './importer';
import { uploadFile, updateMedia } from './media';
import { saveSettings } from './settings';
import { createStatus } from './statuses';

import type { AutoSuggestion } from '@/components/autosuggest-input';
import type { Emoji } from '@/features/emoji';
import type { Status } from '@/normalizers/status';
import type { Policy, Rule, Scope } from '@/pages/settings/interaction-policies';
import type { ClearLinkSuggestion } from '@/reducers/compose';
import type { AppDispatch, RootState } from '@/store';
import type { LinkOptions } from '@tanstack/react-router';
import type { EditorState } from 'lexical';
import type {
  Account,
  CreateStatusParams,
  CustomEmoji,
  Group,
  MediaAttachment,
  Status as BaseStatus,
  Tag,
  Poll,
  ScheduledStatus,
  InteractionPolicy,
  UpdateMediaParams,
  Location,
} from 'pl-api';

let cancelFetchComposeSuggestions = new AbortController();

const COMPOSE_CHANGE = 'COMPOSE_CHANGE' as const;
const COMPOSE_SUBMIT_REQUEST = 'COMPOSE_SUBMIT_REQUEST' as const;
const COMPOSE_SUBMIT_SUCCESS = 'COMPOSE_SUBMIT_SUCCESS' as const;
const COMPOSE_SUBMIT_FAIL = 'COMPOSE_SUBMIT_FAIL' as const;
const COMPOSE_PREVIEW_SUCCESS = 'COMPOSE_PREVIEW_SUCCESS' as const;
const COMPOSE_PREVIEW_CANCEL = 'COMPOSE_PREVIEW_CANCEL' as const;
const COMPOSE_REPLY = 'COMPOSE_REPLY' as const;
const COMPOSE_EVENT_REPLY = 'COMPOSE_EVENT_REPLY' as const;
const COMPOSE_REPLY_CANCEL = 'COMPOSE_REPLY_CANCEL' as const;
const COMPOSE_QUOTE = 'COMPOSE_QUOTE' as const;
const COMPOSE_QUOTE_CANCEL = 'COMPOSE_QUOTE_CANCEL' as const;
const COMPOSE_DIRECT = 'COMPOSE_DIRECT' as const;
const COMPOSE_MENTION = 'COMPOSE_MENTION' as const;
const COMPOSE_RESET = 'COMPOSE_RESET' as const;
const COMPOSE_UPLOAD_REQUEST = 'COMPOSE_UPLOAD_REQUEST' as const;
const COMPOSE_UPLOAD_SUCCESS = 'COMPOSE_UPLOAD_SUCCESS' as const;
const COMPOSE_UPLOAD_FAIL = 'COMPOSE_UPLOAD_FAIL' as const;
const COMPOSE_UPLOAD_PROGRESS = 'COMPOSE_UPLOAD_PROGRESS' as const;
const COMPOSE_UPLOAD_UNDO = 'COMPOSE_UPLOAD_UNDO' as const;
const COMPOSE_GROUP_POST = 'COMPOSE_GROUP_POST' as const;

const COMPOSE_SUGGESTIONS_CLEAR = 'COMPOSE_SUGGESTIONS_CLEAR' as const;
const COMPOSE_SUGGESTIONS_READY = 'COMPOSE_SUGGESTIONS_READY' as const;
const COMPOSE_SUGGESTION_SELECT = 'COMPOSE_SUGGESTION_SELECT' as const;
const COMPOSE_SUGGESTION_TAGS_UPDATE = 'COMPOSE_SUGGESTION_TAGS_UPDATE' as const;

const COMPOSE_SPOILERNESS_CHANGE = 'COMPOSE_SPOILERNESS_CHANGE' as const;
const COMPOSE_TYPE_CHANGE = 'COMPOSE_TYPE_CHANGE' as const;
const COMPOSE_SPOILER_TEXT_CHANGE = 'COMPOSE_SPOILER_TEXT_CHANGE' as const;
const COMPOSE_VISIBILITY_CHANGE = 'COMPOSE_VISIBILITY_CHANGE' as const;
const COMPOSE_LANGUAGE_CHANGE = 'COMPOSE_LANGUAGE_CHANGE' as const;
const COMPOSE_MODIFIED_LANGUAGE_CHANGE = 'COMPOSE_MODIFIED_LANGUAGE_CHANGE' as const;
const COMPOSE_LANGUAGE_ADD = 'COMPOSE_LANGUAGE_ADD' as const;
const COMPOSE_LANGUAGE_DELETE = 'COMPOSE_LANGUAGE_DELETE' as const;
const COMPOSE_FEDERATED_CHANGE = 'COMPOSE_FEDERATED_CHANGE' as const;

const COMPOSE_UPLOAD_CHANGE_REQUEST = 'COMPOSE_UPLOAD_UPDATE_REQUEST' as const;
const COMPOSE_UPLOAD_CHANGE_SUCCESS = 'COMPOSE_UPLOAD_UPDATE_SUCCESS' as const;
const COMPOSE_UPLOAD_CHANGE_FAIL = 'COMPOSE_UPLOAD_UPDATE_FAIL' as const;

const COMPOSE_POLL_ADD = 'COMPOSE_POLL_ADD' as const;
const COMPOSE_POLL_REMOVE = 'COMPOSE_POLL_REMOVE' as const;
const COMPOSE_POLL_OPTION_ADD = 'COMPOSE_POLL_OPTION_ADD' as const;
const COMPOSE_POLL_OPTION_CHANGE = 'COMPOSE_POLL_OPTION_CHANGE' as const;
const COMPOSE_POLL_OPTION_REMOVE = 'COMPOSE_POLL_OPTION_REMOVE' as const;
const COMPOSE_POLL_SETTINGS_CHANGE = 'COMPOSE_POLL_SETTINGS_CHANGE' as const;

const COMPOSE_SCHEDULE_ADD = 'COMPOSE_SCHEDULE_ADD' as const;
const COMPOSE_SCHEDULE_SET = 'COMPOSE_SCHEDULE_SET' as const;
const COMPOSE_SCHEDULE_REMOVE = 'COMPOSE_SCHEDULE_REMOVE' as const;

const COMPOSE_ADD_TO_MENTIONS = 'COMPOSE_ADD_TO_MENTIONS' as const;
const COMPOSE_REMOVE_FROM_MENTIONS = 'COMPOSE_REMOVE_FROM_MENTIONS' as const;

const COMPOSE_SET_STATUS = 'COMPOSE_SET_STATUS' as const;

const COMPOSE_EDITOR_STATE_SET = 'COMPOSE_EDITOR_STATE_SET' as const;

const COMPOSE_CHANGE_MEDIA_ORDER = 'COMPOSE_CHANGE_MEDIA_ORDER' as const;

const COMPOSE_ADD_SUGGESTED_QUOTE = 'COMPOSE_ADD_SUGGESTED_QUOTE' as const;
const COMPOSE_ADD_SUGGESTED_LANGUAGE = 'COMPOSE_ADD_SUGGESTED_LANGUAGE' as const;

const COMPOSE_INTERACTION_POLICY_OPTION_CHANGE =
  'COMPOSE_INTERACTION_POLICY_OPTION_CHANGE' as const;
const COMPOSE_QUOTE_POLICY_OPTION_CHANGE = 'COMPOSE_QUOTE_POLICY_OPTION_CHANGE' as const;

const COMPOSE_CLEAR_LINK_SUGGESTION_CREATE = 'COMPOSE_CLEAR_LINK_SUGGESTION_CREATE' as const;
const COMPOSE_CLEAR_LINK_SUGGESTION_IGNORE = 'COMPOSE_CLEAR_LINK_SUGGESTION_IGNORE' as const;

const COMPOSE_HASHTAG_CASING_SUGGESTION_SET = 'COMPOSE_HASHTAG_CASING_SUGGESTION_SET' as const;
const COMPOSE_HASHTAG_CASING_SUGGESTION_IGNORE =
  'COMPOSE_HASHTAG_CASING_SUGGESTION_IGNORE' as const;

const COMPOSE_REDACTING_OVERWRITE_CHANGE = 'COMPOSE_REDACTING_OVERWRITE_CHANGE' as const;

const COMPOSE_SET_LOCATION = 'COMPOSE_SET_LOCATION' as const;
const COMPOSE_SET_SHOW_LOCATION_PICKER = 'COMPOSE_SET_SHOW_LOCATION_PICKER' as const;

const messages = defineMessages({
  scheduleError: {
    id: 'compose.invalid_schedule',
    defaultMessage: 'You must schedule a post at least 5 minutes out.',
  },
  success: { id: 'compose.submit_success', defaultMessage: 'Your post was sent!' },
  editSuccess: { id: 'compose.edit_success', defaultMessage: 'Your post was edited' },
  redactSuccess: { id: 'compose.redact_success', defaultMessage: 'The post was redacted' },
  scheduledSuccess: { id: 'compose.scheduled_success', defaultMessage: 'Your post was scheduled' },
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
});

interface ComposeSetStatusAction {
  type: typeof COMPOSE_SET_STATUS;
  composeId: string;
  status: Pick<
    Status,
    | 'id'
    | 'account'
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
  >;
  poll?: Poll | null;
  rawText: string;
  explicitAddressing: boolean;
  spoilerText?: string;
  contentType?: string | false;
  withRedraft?: boolean;
  draftId?: string;
  editorState?: string | null;
  redacting?: boolean;
}

const setComposeToStatus =
  (
    status: ComposeSetStatusAction['status'],
    poll: Poll | null | undefined,
    rawText: string,
    spoilerText?: string,
    contentType?: string | false,
    withRedraft?: boolean,
    draftId?: string,
    editorState?: string | null,
    redacting?: boolean,
  ) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { features } = getClient(getState);
    const explicitAddressing =
      features.createStatusExplicitAddressing &&
      !useSettingsStore.getState().settings.forceImplicitAddressing;

    dispatch<ComposeSetStatusAction>({
      type: COMPOSE_SET_STATUS,
      composeId: 'compose-modal',
      status,
      poll,
      rawText,
      explicitAddressing,
      spoilerText,
      contentType,
      withRedraft,
      draftId,
      editorState,
      redacting,
    });
  };

const changeCompose = (composeId: string, text: string) => ({
  type: COMPOSE_CHANGE,
  composeId,
  text: text,
});

interface ComposeReplyAction {
  type: typeof COMPOSE_REPLY;
  composeId: string;
  status: Pick<
    Status,
    | 'id'
    | 'account'
    | 'group_id'
    | 'list_id'
    | 'local_only'
    | 'mentions'
    | 'spoiler_text'
    | 'visibility'
  >;
  account: Pick<Account, 'acct'>;
  explicitAddressing: boolean;
  preserveSpoilers: boolean;
  rebloggedBy?: Pick<Account, 'acct' | 'id'>;
  approvalRequired?: boolean;
  conversationScope: boolean;
}

const replyCompose =
  (
    status: ComposeReplyAction['status'],
    rebloggedBy?: ComposeReplyAction['rebloggedBy'],
    approvalRequired?: ComposeReplyAction['approvalRequired'],
  ) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const { features } = getClient(getState);
    const { forceImplicitAddressing, preserveSpoilers } = useSettingsStore.getState().settings;
    const explicitAddressing = features.createStatusExplicitAddressing && !forceImplicitAddressing;
    const account = selectOwnAccount(state);

    if (!account) return;

    dispatch<ComposeReplyAction>({
      type: COMPOSE_REPLY,
      composeId: 'compose-modal',
      status,
      account,
      explicitAddressing,
      preserveSpoilers,
      rebloggedBy,
      approvalRequired,
      conversationScope: features.createStatusConversationScope,
    });
    useModalsStore.getState().actions.openModal('COMPOSE');
  };

const cancelReplyCompose = () => ({
  type: COMPOSE_REPLY_CANCEL,
  composeId: 'compose-modal',
});

interface ComposeQuoteAction {
  type: typeof COMPOSE_QUOTE;
  composeId: string;
  status: Pick<Status, 'id' | 'account' | 'visibility' | 'group_id' | 'list_id'>;
  account: Pick<Account, 'acct'> | undefined;
  explicitAddressing: boolean;
  conversationScope: boolean;
  approvalRequired?: boolean;
}

const quoteCompose =
  (status: ComposeQuoteAction['status'], approvalRequired?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const { forceImplicitAddressing } = useSettingsStore.getState().settings;
    const { createStatusConversationScope, createStatusExplicitAddressing } =
      state.auth.client.features;
    const explicitAddressing = createStatusExplicitAddressing && !forceImplicitAddressing;

    dispatch<ComposeQuoteAction>({
      type: COMPOSE_QUOTE,
      composeId: 'compose-modal',
      status,
      account: selectOwnAccount(state),
      explicitAddressing,
      conversationScope: createStatusConversationScope,
      approvalRequired,
    });
    useModalsStore.getState().actions.openModal('COMPOSE');
  };

const cancelQuoteCompose = (composeId: string) => ({
  type: COMPOSE_QUOTE_CANCEL,
  composeId,
});

const groupComposeModal = (group: Pick<Group, 'id'>) => (dispatch: AppDispatch) => {
  const composeId = `group:${group.id}`;

  dispatch(groupCompose(composeId, group.id));
  useModalsStore.getState().actions.openModal('COMPOSE', { composeId });
};

const resetCompose = (composeId = 'compose-modal') => ({
  type: COMPOSE_RESET,
  composeId,
});

interface ComposeMentionAction {
  type: typeof COMPOSE_MENTION;
  composeId: string;
  account: Pick<Account, 'acct'>;
}

const mentionCompose =
  (account: ComposeMentionAction['account']) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!getState().me) return;

    dispatch<ComposeMentionAction>({
      type: COMPOSE_MENTION,
      composeId: 'compose-modal',
      account: account,
    });
    useModalsStore.getState().actions.openModal('COMPOSE');
  };

interface ComposeDirectAction {
  type: typeof COMPOSE_DIRECT;
  composeId: string;
  account: Pick<Account, 'acct'>;
}

const directCompose = (account: ComposeDirectAction['account']) => (dispatch: AppDispatch) => {
  dispatch<ComposeDirectAction>({
    type: COMPOSE_DIRECT,
    composeId: 'compose-modal',
    account,
  });
  useModalsStore.getState().actions.openModal('COMPOSE');
};

const handleComposeSubmit = (
  dispatch: AppDispatch,
  getState: () => RootState,
  composeId: string,
  data: BaseStatus | ScheduledStatus,
  status: string,
  edit?: boolean,
  redact?: boolean,
) => {
  if (!dispatch || !getState) return;

  const state = getState();

  const accountUrl = selectOwnAccount(state)!.url;
  const draftId = getState().compose[composeId].draftId;

  dispatch(submitComposeSuccess(composeId, data));

  if (draftId) {
    cancelDraftStatus(queryClient, accountUrl, draftId);
  }

  if (data.scheduled_at === null) {
    const linkOptions: LinkOptions =
      data.visibility === 'direct' && getClient(getState()).features.conversations
        ? { to: '/conversations' }
        : {
            to: '/@{$username}/posts/$statusId',
            params: { username: data.account.acct, statusId: data.id },
          };
    toast.success(
      redact ? messages.redactSuccess : edit ? messages.editSuccess : messages.success,
      {
        actionLabel: messages.view,
        actionLinkOptions: linkOptions,
      },
    );
  } else {
    toast.success(messages.scheduledSuccess, {
      actionLabel: messages.view,
      actionLinkOptions: { to: '/scheduled_statuses' },
    });
  }
};

const needsDescriptions = (state: RootState, composeId: string) => {
  const media = state.compose[composeId].mediaAttachments;
  const missingDescriptionModal = useSettingsStore.getState().settings.missingDescriptionModal;

  const hasMissing = media.filter((item) => !item.description).length > 0;

  return missingDescriptionModal && hasMissing;
};

const validateSchedule = (state: RootState, composeId: string) => {
  const scheduledAt = state.compose[composeId]?.scheduledAt;
  if (!scheduledAt) return true;

  const fiveMinutesFromNow = new Date(new Date().getTime() + 300000);

  return (
    scheduledAt.getTime() > fiveMinutesFromNow.getTime() ||
    (state.auth.client.features.scheduledStatusesBackwards &&
      scheduledAt.getTime() < new Date().getTime())
  );
};

interface SubmitComposeOpts {
  force?: boolean;
  onSuccess?: () => void;
}

const submitCompose =
  (composeId: string, opts: SubmitComposeOpts = {}, preview = false) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const { force = false, onSuccess } = opts;

    if (!isLoggedIn(getState)) return;
    const state = getState();

    const compose = state.compose[composeId];

    const status = compose.text;
    const media = compose.mediaAttachments;
    const editedId = compose.editedId;
    let to = compose.to;
    const { forceImplicitAddressing } = useSettingsStore.getState().settings;
    const explicitAddressing =
      state.auth.client.features.createStatusExplicitAddressing && !forceImplicitAddressing;

    if (!preview) {
      if (!validateSchedule(state, composeId)) {
        toast.error(messages.scheduleError);
        return;
      }

      if ((!status || !status.length) && media.length === 0) {
        return;
      }

      if (!force && needsDescriptions(state, composeId)) {
        useModalsStore.getState().actions.openModal('MISSING_DESCRIPTION', {
          onContinue: () => {
            useModalsStore.getState().actions.closeModal('MISSING_DESCRIPTION');
            dispatch(submitCompose(composeId, { force: true, onSuccess }));
          },
        });
        return;
      }
    }

    // https://stackoverflow.com/a/30007882 for domain regex
    const mentions: string[] | null = status.match(
      /(?:^|\s)@([a-z\d_-]+(?:@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]+)?)/gi,
    );

    if (mentions) {
      to = [
        ...new Set([
          ...to,
          ...mentions.map((mention) =>
            mention
              .replace(/&#x20;/g, '')
              .trim()
              .slice(1),
          ),
        ]),
      ];
    }

    if (!preview) {
      dispatch(submitComposeRequest(composeId));

      useModalsStore.getState().actions.closeModal('COMPOSE');

      if (compose.language && !editedId && !preview) {
        useSettingsStore.getState().actions.rememberLanguageUse(compose.language);
        dispatch(saveSettings());
      }
    }

    const idempotencyKey = compose.idempotencyKey;
    const contentType = compose.contentType === 'wysiwyg' ? 'text/markdown' : compose.contentType;

    const params: CreateStatusParams = {
      status,
      in_reply_to_id: compose.inReplyToId ?? undefined,
      quote_id: compose.quoteId ?? undefined,
      media_ids: media.map((item) => item.id),
      sensitive: compose.sensitive,
      spoiler_text: compose.spoilerText,
      visibility: compose.visibility,
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
      preview,
    };

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
      params.status_map[compose.language] = status;

      if (params.spoiler_text) {
        params.spoiler_text_map = compose.spoilerTextMap;
        params.spoiler_text_map[compose.language] = compose.spoilerText;
      }

      const poll = params.poll;
      if (poll?.options_map) {
        poll.options.forEach(
          (option, index: number) => (poll.options_map![index][compose.language!] = option),
        );
      }
    }

    if (compose.visibility === 'group' && compose.groupId) {
      params.group_id = compose.groupId;
    }

    if (preview) {
      const data = await getClient(state).statuses.previewStatus(params);
      dispatch(previewComposeSuccess(composeId, data));
      onSuccess?.();
    } else {
      if (compose.redacting) {
        // @ts-ignore
        params.overwrite = compose.redactingOverwrite;
      }

      try {
        const data = await dispatch(
          createStatus(params, idempotencyKey, editedId, compose.redacting),
        );
        handleComposeSubmit(
          dispatch,
          getState,
          composeId,
          data,
          status,
          !!editedId,
          compose.redacting,
        );
        onSuccess?.();
      } catch (error) {
        dispatch(submitComposeFail(composeId, error));
      }
    }
  };

const submitComposeRequest = (composeId: string) => ({
  type: COMPOSE_SUBMIT_REQUEST,
  composeId,
});

const submitComposeSuccess = (composeId: string, status: BaseStatus | ScheduledStatus) => ({
  type: COMPOSE_SUBMIT_SUCCESS,
  composeId,
  status,
});

const submitComposeFail = (composeId: string, error: unknown) => ({
  type: COMPOSE_SUBMIT_FAIL,
  composeId,
  error,
});

const previewComposeSuccess = (composeId: string, status: Partial<BaseStatus>) => ({
  type: COMPOSE_PREVIEW_SUCCESS,
  composeId,
  status,
});

const cancelPreviewCompose = (composeId: string) => ({
  type: COMPOSE_PREVIEW_CANCEL,
  composeId,
});

const uploadCompose =
  (composeId: string, files: FileList, intl: IntlShape) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;
    const attachmentLimit = getState().instance.configuration.statuses.max_media_attachments;

    const media = getState().compose[composeId]?.mediaAttachments;
    const progress = new Array(files.length).fill(0);
    let total = Array.from(files).reduce((a, v) => a + v.size, 0);

    const mediaCount = media ? media.length : 0;

    if (files.length + mediaCount > attachmentLimit) {
      toast.error(messages.uploadErrorLimit);
      return;
    }

    dispatch(uploadComposeRequest(composeId));

    Array.from(files).forEach((f, i) => {
      if (mediaCount + i > attachmentLimit - 1) return;

      dispatch(
        uploadFile(
          f,
          intl,
          (data) => dispatch(uploadComposeSuccess(composeId, data)),
          (error) => dispatch(uploadComposeFail(composeId, error)),
          ({ loaded }) => {
            progress[i] = loaded;
            dispatch(
              uploadComposeProgress(
                composeId,
                progress.reduce((a, v) => a + v, 0),
                total,
              ),
            );
          },
          (value) => (total += value),
        ),
      );
    });
  };

const uploadComposeRequest = (composeId: string) => ({
  type: COMPOSE_UPLOAD_REQUEST,
  composeId,
});

const uploadComposeProgress = (composeId: string, loaded: number, total: number) => ({
  type: COMPOSE_UPLOAD_PROGRESS,
  composeId,
  loaded,
  total,
});

const uploadComposeSuccess = (composeId: string, media: MediaAttachment) => ({
  type: COMPOSE_UPLOAD_SUCCESS,
  composeId,
  media,
});

const uploadComposeFail = (composeId: string, error: unknown) => ({
  type: COMPOSE_UPLOAD_FAIL,
  composeId,
  error,
});

const changeUploadCompose =
  (composeId: string, mediaId: string, params: UpdateMediaParams) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return Promise.resolve();

    dispatch(changeUploadComposeRequest(composeId));

    return dispatch(updateMedia(mediaId, params))
      .then((response) => {
        dispatch(changeUploadComposeSuccess(composeId, response));
        return response;
      })
      .catch((error) => {
        dispatch(changeUploadComposeFail(composeId, mediaId, error));
      });
  };

const changeUploadComposeRequest = (composeId: string) => ({
  type: COMPOSE_UPLOAD_CHANGE_REQUEST,
  composeId,
});

const changeUploadComposeSuccess = (composeId: string, media: MediaAttachment) => ({
  type: COMPOSE_UPLOAD_CHANGE_SUCCESS,
  composeId,
  media,
});

const changeUploadComposeFail = (composeId: string, mediaId: string, error: unknown) => ({
  type: COMPOSE_UPLOAD_CHANGE_FAIL,
  composeId,
  mediaId,
  error,
});

const undoUploadCompose = (composeId: string, mediaId: string) => ({
  type: COMPOSE_UPLOAD_UNDO,
  composeId,
  mediaId,
});

const groupCompose = (composeId: string, groupId: string) => ({
  type: COMPOSE_GROUP_POST,
  composeId,
  groupId,
});

const clearComposeSuggestions = (composeId: string) => {
  if (cancelFetchComposeSuggestions) {
    cancelFetchComposeSuggestions.abort();
    cancelFetchComposeSuggestions = new AbortController();
  }
  return {
    type: COMPOSE_SUGGESTIONS_CLEAR,
    composeId,
  };
};

const fetchComposeSuggestionsAccounts = throttle(
  (dispatch, getState, composeId, token) => {
    if (cancelFetchComposeSuggestions) {
      cancelFetchComposeSuggestions.abort();
      cancelFetchComposeSuggestions = new AbortController();
    }

    const signal = cancelFetchComposeSuggestions.signal;

    return getClient(getState)
      .accounts.searchAccounts(token.slice(1), { resolve: false, limit: 10 }, { signal })
      .then((response) => {
        dispatch(importEntities({ accounts: response }));
        dispatch(readyComposeSuggestionsAccounts(composeId, token, response));
      })
      .catch((error) => {
        if (!signal.aborted) {
          toast.showAlertForError(error);
        }
      });
  },
  200,
  { leading: true, trailing: true },
);

const fetchComposeSuggestionsEmojis = (dispatch: AppDispatch, composeId: string, token: string) => {
  const customEmojis = queryClient.getQueryData<Array<CustomEmoji>>(['instance', 'customEmojis']);
  const results = emojiSearch(token.replace(':', ''), { maxResults: 10 }, customEmojis);

  dispatch(readyComposeSuggestionsEmojis(composeId, token, results));
};

const fetchComposeSuggestionsTags = (
  dispatch: AppDispatch,
  getState: () => RootState,
  composeId: string,
  token: string,
) => {
  const signal = cancelFetchComposeSuggestions.signal;

  if (cancelFetchComposeSuggestions) {
    cancelFetchComposeSuggestions.abort();
    cancelFetchComposeSuggestions = new AbortController();
  }

  const state = getState();

  const { trends } = state.auth.client.features;

  if (trends) {
    const currentTrends = queryClient.getQueryData<Array<Tag>>(['trends', 'tags']) ?? [];

    return dispatch(updateSuggestionTags(composeId, token, currentTrends));
  }

  return getClient(state)
    .search.search(token.slice(1), { limit: 10, type: 'hashtags' }, { signal })
    .then((response) => {
      dispatch(updateSuggestionTags(composeId, token, response.hashtags));
    })
    .catch((error) => {
      if (!signal.aborted) {
        toast.showAlertForError(error);
      }
    });
};

const fetchComposeSuggestions =
  (composeId: string, token: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    switch (token[0]) {
      case ':':
        fetchComposeSuggestionsEmojis(dispatch, composeId, token);
        break;
      case '#':
        fetchComposeSuggestionsTags(dispatch, getState, composeId, token);
        break;
      default:
        fetchComposeSuggestionsAccounts(dispatch, getState, composeId, token);
        break;
    }
  };

interface ComposeSuggestionsReadyAction {
  type: typeof COMPOSE_SUGGESTIONS_READY;
  composeId: string;
  token: string;
  emojis?: Emoji[];
  accounts?: Account[];
}

const readyComposeSuggestionsEmojis = (composeId: string, token: string, emojis: Emoji[]) => ({
  type: COMPOSE_SUGGESTIONS_READY,
  composeId,
  token,
  emojis,
});

const readyComposeSuggestionsAccounts = (
  composeId: string,
  token: string,
  accounts: Account[],
) => ({
  type: COMPOSE_SUGGESTIONS_READY,
  composeId,
  token,
  accounts,
});

interface ComposeSuggestionSelectAction {
  type: typeof COMPOSE_SUGGESTION_SELECT;
  composeId: string;
  position: number;
  token: string | null;
  completion: string;
  path: ['spoiler_text'] | ['poll', 'options', number];
}

const selectComposeSuggestion =
  (
    composeId: string,
    position: number,
    token: string | null,
    suggestion: AutoSuggestion,
    path: ComposeSuggestionSelectAction['path'],
  ) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    let completion = '',
      startPosition = position;

    if (typeof suggestion === 'object' && 'id' in suggestion) {
      completion = isNativeEmoji(suggestion) ? suggestion.native : suggestion.colons;
      startPosition = position - 1;

      useSettingsStore.getState().actions.rememberEmojiUse(suggestion);
      dispatch(saveSettings());
    } else if (typeof suggestion === 'string' && suggestion[0] === '#') {
      completion = suggestion;
      startPosition = position - 1;
    } else if (typeof suggestion === 'string') {
      completion = selectAccount(suggestion)!.acct;
      startPosition = position;
    }

    dispatch<ComposeSuggestionSelectAction>({
      type: COMPOSE_SUGGESTION_SELECT,
      composeId,
      position: startPosition,
      token,
      completion,
      path,
    });
  };

const updateSuggestionTags = (composeId: string, token: string, tags: Array<Tag>) => ({
  type: COMPOSE_SUGGESTION_TAGS_UPDATE,
  composeId,
  token,
  tags,
});

const changeComposeSpoilerness = (composeId: string) => ({
  type: COMPOSE_SPOILERNESS_CHANGE,
  composeId,
});

const changeComposeContentType = (composeId: string, value: string) => ({
  type: COMPOSE_TYPE_CHANGE,
  composeId,
  value,
});

const changeComposeSpoilerText = (composeId: string, text: string) => ({
  type: COMPOSE_SPOILER_TEXT_CHANGE,
  composeId,
  text,
});

const changeComposeVisibility = (composeId: string, value: string) => ({
  type: COMPOSE_VISIBILITY_CHANGE,
  composeId,
  value,
});

const changeComposeLanguage = (composeId: string, value: Language | null) => ({
  type: COMPOSE_LANGUAGE_CHANGE,
  composeId,
  value,
});

const changeComposeModifiedLanguage = (composeId: string, value: Language | null) => ({
  type: COMPOSE_MODIFIED_LANGUAGE_CHANGE,
  composeId,
  value,
});

const addComposeLanguage = (composeId: string, value: Language) => ({
  type: COMPOSE_LANGUAGE_ADD,
  composeId,
  value,
});

const deleteComposeLanguage = (composeId: string, value: Language) => ({
  type: COMPOSE_LANGUAGE_DELETE,
  composeId,
  value,
});

const addPoll = (composeId: string) => ({
  type: COMPOSE_POLL_ADD,
  composeId,
});

const removePoll = (composeId: string) => ({
  type: COMPOSE_POLL_REMOVE,
  composeId,
});

const addSchedule = (composeId: string) => ({
  type: COMPOSE_SCHEDULE_ADD,
  composeId,
});

const setSchedule = (composeId: string, date: Date) => ({
  type: COMPOSE_SCHEDULE_SET,
  composeId,
  date: date,
});

const removeSchedule = (composeId: string) => ({
  type: COMPOSE_SCHEDULE_REMOVE,
  composeId,
});

const addPollOption = (composeId: string, title: string) => ({
  type: COMPOSE_POLL_OPTION_ADD,
  composeId,
  title,
});

const changePollOption = (composeId: string, index: number, title: string) => ({
  type: COMPOSE_POLL_OPTION_CHANGE,
  composeId,
  index,
  title,
});

const removePollOption = (composeId: string, index: number) => ({
  type: COMPOSE_POLL_OPTION_REMOVE,
  composeId,
  index,
});

const changePollSettings = (composeId: string, expiresIn?: number, isMultiple?: boolean) => ({
  type: COMPOSE_POLL_SETTINGS_CHANGE,
  composeId,
  expiresIn,
  isMultiple,
});

const openComposeWithText =
  (composeId: string, text = '') =>
  (dispatch: AppDispatch) => {
    dispatch(resetCompose(composeId));
    useModalsStore.getState().actions.openModal('COMPOSE');
    dispatch(changeCompose(composeId, text));
  };

interface ComposeAddToMentionsAction {
  type: typeof COMPOSE_ADD_TO_MENTIONS;
  composeId: string;
  account: string;
}

const addToMentions = (composeId: string, accountId: string) => (dispatch: AppDispatch) => {
  const account = selectAccount(accountId);
  if (!account) return;

  return dispatch<ComposeAddToMentionsAction>({
    type: COMPOSE_ADD_TO_MENTIONS,
    composeId,
    account: account.acct,
  });
};

interface ComposeRemoveFromMentionsAction {
  type: typeof COMPOSE_REMOVE_FROM_MENTIONS;
  composeId: string;
  account: string;
}

const removeFromMentions = (composeId: string, accountId: string) => (dispatch: AppDispatch) => {
  const account = selectAccount(accountId);
  if (!account) return;

  return dispatch<ComposeRemoveFromMentionsAction>({
    type: COMPOSE_REMOVE_FROM_MENTIONS,
    composeId,
    account: account.acct,
  });
};

interface ComposeEventReplyAction {
  type: typeof COMPOSE_EVENT_REPLY;
  composeId: string;
  status: Pick<Status, 'id' | 'account' | 'mentions'>;
  account: Pick<Account, 'acct'>;
  explicitAddressing: boolean;
}

const eventDiscussionCompose =
  (composeId: string, status: ComposeEventReplyAction['status']) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const { forceImplicitAddressing } = useSettingsStore.getState().settings;
    const explicitAddressing =
      state.auth.client.features.createStatusExplicitAddressing && !forceImplicitAddressing;

    return dispatch({
      type: COMPOSE_EVENT_REPLY,
      composeId,
      status,
      account: selectOwnAccount(state),
      explicitAddressing,
    });
  };

const setEditorState = (
  composeId: string,
  editorState: EditorState | string | null,
  text?: string,
) => ({
  type: COMPOSE_EDITOR_STATE_SET,
  composeId,
  editorState,
  text,
});

const changeMediaOrder = (composeId: string, a: string, b: string) => ({
  type: COMPOSE_CHANGE_MEDIA_ORDER,
  composeId,
  a,
  b,
});

const addSuggestedQuote = (composeId: string, quoteId: string) => ({
  type: COMPOSE_ADD_SUGGESTED_QUOTE,
  composeId,
  quoteId,
});

const addSuggestedLanguage = (composeId: string, language: string) => ({
  type: COMPOSE_ADD_SUGGESTED_LANGUAGE,
  composeId,
  language,
});

const changeComposeFederated = (composeId: string) => ({
  type: COMPOSE_FEDERATED_CHANGE,
  composeId,
});

const changeComposeInteractionPolicyOption = (
  composeId: string,
  policy: Policy,
  rule: Rule,
  value: Scope[],
  initial: InteractionPolicy,
) => ({
  type: COMPOSE_INTERACTION_POLICY_OPTION_CHANGE,
  composeId,
  policy,
  rule,
  value,
  initial,
});

const changeComposeQuotePolicyOption = (
  composeId: string,
  value: CreateStatusParams['quote_approval_policy'],
) => ({
  type: COMPOSE_QUOTE_POLICY_OPTION_CHANGE,
  composeId,
  value,
});

const suggestClearLink = (composeId: string, suggestion: ClearLinkSuggestion | null) => ({
  type: COMPOSE_CLEAR_LINK_SUGGESTION_CREATE,
  composeId,
  suggestion,
});

const ignoreClearLinkSuggestion = (composeId: string, key: string) => ({
  type: COMPOSE_CLEAR_LINK_SUGGESTION_IGNORE,
  composeId,
  key,
});

const suggestHashtagCasing = (composeId: string, suggestion: string | null) => ({
  type: COMPOSE_HASHTAG_CASING_SUGGESTION_SET,
  composeId,
  suggestion,
});

const ignoreHashtagCasingSuggestion = (composeId: string) => ({
  type: COMPOSE_HASHTAG_CASING_SUGGESTION_IGNORE,
  composeId,
});

const changeComposeRedactingOverwrite = (composeId: string, value: boolean) => ({
  type: COMPOSE_REDACTING_OVERWRITE_CHANGE,
  composeId,
  value,
});

const setComposeLocation = (composeId: string, location: Location | null) => ({
  type: COMPOSE_SET_LOCATION,
  composeId,
  location,
});

const setComposeShowLocationPicker = (composeId: string, showLocation: boolean) => ({
  type: COMPOSE_SET_SHOW_LOCATION_PICKER,
  composeId,
  showLocation,
});

type ComposeAction =
  | ComposeSetStatusAction
  | ReturnType<typeof changeCompose>
  | ComposeReplyAction
  | ReturnType<typeof cancelReplyCompose>
  | ComposeQuoteAction
  | ReturnType<typeof cancelQuoteCompose>
  | ReturnType<typeof resetCompose>
  | ComposeMentionAction
  | ComposeDirectAction
  | ReturnType<typeof submitComposeRequest>
  | ReturnType<typeof submitComposeSuccess>
  | ReturnType<typeof submitComposeFail>
  | ReturnType<typeof previewComposeSuccess>
  | ReturnType<typeof cancelPreviewCompose>
  | ReturnType<typeof changeUploadComposeRequest>
  | ReturnType<typeof changeUploadComposeSuccess>
  | ReturnType<typeof changeUploadComposeFail>
  | ReturnType<typeof uploadComposeRequest>
  | ReturnType<typeof uploadComposeProgress>
  | ReturnType<typeof uploadComposeSuccess>
  | ReturnType<typeof uploadComposeFail>
  | ReturnType<typeof undoUploadCompose>
  | ReturnType<typeof groupCompose>
  | ReturnType<typeof clearComposeSuggestions>
  | ComposeSuggestionsReadyAction
  | ComposeSuggestionSelectAction
  | ReturnType<typeof updateSuggestionTags>
  | ReturnType<typeof changeComposeSpoilerness>
  | ReturnType<typeof changeComposeContentType>
  | ReturnType<typeof changeComposeSpoilerText>
  | ReturnType<typeof changeComposeVisibility>
  | ReturnType<typeof changeComposeLanguage>
  | ReturnType<typeof changeComposeModifiedLanguage>
  | ReturnType<typeof addComposeLanguage>
  | ReturnType<typeof deleteComposeLanguage>
  | ReturnType<typeof addPoll>
  | ReturnType<typeof removePoll>
  | ReturnType<typeof addSchedule>
  | ReturnType<typeof setSchedule>
  | ReturnType<typeof removeSchedule>
  | ReturnType<typeof addPollOption>
  | ReturnType<typeof changePollOption>
  | ReturnType<typeof removePollOption>
  | ReturnType<typeof changePollSettings>
  | ComposeAddToMentionsAction
  | ComposeRemoveFromMentionsAction
  | ComposeEventReplyAction
  | ReturnType<typeof setEditorState>
  | ReturnType<typeof changeMediaOrder>
  | ReturnType<typeof addSuggestedQuote>
  | ReturnType<typeof addSuggestedLanguage>
  | ReturnType<typeof changeComposeFederated>
  | ReturnType<typeof changeComposeInteractionPolicyOption>
  | ReturnType<typeof changeComposeQuotePolicyOption>
  | ReturnType<typeof suggestClearLink>
  | ReturnType<typeof ignoreClearLinkSuggestion>
  | ReturnType<typeof suggestHashtagCasing>
  | ReturnType<typeof ignoreHashtagCasingSuggestion>
  | ReturnType<typeof changeComposeRedactingOverwrite>
  | ReturnType<typeof setComposeLocation>
  | ReturnType<typeof setComposeShowLocationPicker>;

export {
  COMPOSE_CHANGE,
  COMPOSE_SUBMIT_REQUEST,
  COMPOSE_SUBMIT_SUCCESS,
  COMPOSE_SUBMIT_FAIL,
  COMPOSE_PREVIEW_SUCCESS,
  COMPOSE_PREVIEW_CANCEL,
  COMPOSE_REPLY,
  COMPOSE_REPLY_CANCEL,
  COMPOSE_EVENT_REPLY,
  COMPOSE_QUOTE,
  COMPOSE_QUOTE_CANCEL,
  COMPOSE_DIRECT,
  COMPOSE_MENTION,
  COMPOSE_RESET,
  COMPOSE_UPLOAD_REQUEST,
  COMPOSE_UPLOAD_SUCCESS,
  COMPOSE_UPLOAD_FAIL,
  COMPOSE_UPLOAD_PROGRESS,
  COMPOSE_UPLOAD_UNDO,
  COMPOSE_GROUP_POST,
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
  COMPOSE_UPLOAD_CHANGE_REQUEST,
  COMPOSE_UPLOAD_CHANGE_SUCCESS,
  COMPOSE_UPLOAD_CHANGE_FAIL,
  COMPOSE_POLL_ADD,
  COMPOSE_POLL_REMOVE,
  COMPOSE_POLL_OPTION_ADD,
  COMPOSE_POLL_OPTION_CHANGE,
  COMPOSE_POLL_OPTION_REMOVE,
  COMPOSE_POLL_SETTINGS_CHANGE,
  COMPOSE_SCHEDULE_ADD,
  COMPOSE_SCHEDULE_SET,
  COMPOSE_SCHEDULE_REMOVE,
  COMPOSE_ADD_TO_MENTIONS,
  COMPOSE_REMOVE_FROM_MENTIONS,
  COMPOSE_SET_STATUS,
  COMPOSE_EDITOR_STATE_SET,
  COMPOSE_CHANGE_MEDIA_ORDER,
  COMPOSE_ADD_SUGGESTED_QUOTE,
  COMPOSE_ADD_SUGGESTED_LANGUAGE,
  COMPOSE_FEDERATED_CHANGE,
  COMPOSE_INTERACTION_POLICY_OPTION_CHANGE,
  COMPOSE_QUOTE_POLICY_OPTION_CHANGE,
  COMPOSE_CLEAR_LINK_SUGGESTION_CREATE,
  COMPOSE_CLEAR_LINK_SUGGESTION_IGNORE,
  COMPOSE_HASHTAG_CASING_SUGGESTION_SET,
  COMPOSE_HASHTAG_CASING_SUGGESTION_IGNORE,
  COMPOSE_REDACTING_OVERWRITE_CHANGE,
  COMPOSE_SET_LOCATION,
  COMPOSE_SET_SHOW_LOCATION_PICKER,
  setComposeToStatus,
  replyCompose,
  cancelReplyCompose,
  quoteCompose,
  cancelQuoteCompose,
  resetCompose,
  mentionCompose,
  directCompose,
  submitCompose,
  uploadFile,
  uploadCompose,
  changeUploadCompose,
  uploadComposeSuccess,
  undoUploadCompose,
  groupCompose,
  groupComposeModal,
  clearComposeSuggestions,
  fetchComposeSuggestions,
  selectComposeSuggestion,
  changeComposeSpoilerness,
  changeComposeContentType,
  changeComposeSpoilerText,
  changeComposeVisibility,
  changeComposeLanguage,
  changeComposeModifiedLanguage,
  addComposeLanguage,
  deleteComposeLanguage,
  addPoll,
  removePoll,
  addSchedule,
  setSchedule,
  removeSchedule,
  addPollOption,
  changePollOption,
  removePollOption,
  changePollSettings,
  openComposeWithText,
  addToMentions,
  removeFromMentions,
  eventDiscussionCompose,
  setEditorState,
  changeMediaOrder,
  addSuggestedQuote,
  addSuggestedLanguage,
  changeComposeFederated,
  changeComposeInteractionPolicyOption,
  changeComposeQuotePolicyOption,
  suggestClearLink,
  ignoreClearLinkSuggestion,
  cancelPreviewCompose,
  suggestHashtagCasing,
  ignoreHashtagCasingSuggestion,
  changeComposeRedactingOverwrite,
  setComposeLocation,
  setComposeShowLocationPicker,
  type ComposeReplyAction,
  type ComposeSuggestionSelectAction,
  type ComposeAction,
};
