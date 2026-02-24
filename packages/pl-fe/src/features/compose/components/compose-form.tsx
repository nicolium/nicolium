import clsx from 'clsx';
import { $getNodeByKey, CLEAR_EDITOR_COMMAND, TextNode, type LexicalEditor } from 'lexical';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { length } from 'stringz';

import {
  submitCompose,
  clearComposeSuggestions,
  fetchComposeSuggestions,
  selectComposeSuggestion,
  uploadCompose,
  ignoreClearLinkSuggestion,
  suggestClearLink,
  resetCompose,
  changeComposeRedactingOverwrite,
} from '@/actions/compose';
import DropdownMenu from '@/components/dropdown-menu';
import List, { ListItem } from '@/components/list';
import Icon from '@/components/ui/icon';
import SvgIcon from '@/components/ui/svg-icon';
import Toggle from '@/components/ui/toggle';
import EmojiPickerDropdown from '@/features/emoji/containers/emoji-picker-dropdown-container';
import { ComposeEditor } from '@/features/ui/util/async-components';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useCompose } from '@/hooks/use-compose';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useFeatures } from '@/hooks/use-features';
import { useInstance } from '@/hooks/use-instance';
import { usePersistDraftStatus } from '@/queries/statuses/use-draft-statuses';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import PreviewComposeContainer from '../containers/preview-compose-container';
import QuotedStatusContainer from '../containers/quoted-status-container';
import ReplyIndicatorContainer from '../containers/reply-indicator-container';
import UploadButtonContainer from '../containers/upload-button-container';
import WarningContainer from '../containers/warning-container';
import { $createEmojiNode } from '../editor/nodes/emoji-node';
import { countableText } from '../util/counter';

import ClearLinkSuggestion from './clear-link-suggestion';
import ContentTypeButton from './content-type-button';
import DriveButton from './drive-button';
import HashtagCasingSuggestion from './hashtag-casing-suggestion';
import InteractionPolicyButton from './interaction-policy-button';
import LanguageDropdown from './language-dropdown';
import LocationButton from './location-button';
import LocationForm from './location-form';
import PollButton from './poll-button';
import PollForm from './polls/poll-form';
import PrivacyDropdown from './privacy-dropdown';
import ReplyGroupIndicator from './reply-group-indicator';
import ReplyMentions from './reply-mentions';
import ScheduleButton from './schedule-button';
import ScheduleForm from './schedule-form';
import SensitiveMediaButton from './sensitive-media-button';
import SpoilerInput from './spoiler-input';
import TextCharacterCounter from './text-character-counter';
import UploadForm from './upload-form';
import VisualCharacterCounter from './visual-character-counter';
import Warning from './warning';

import type { AutoSuggestion } from '@/components/autosuggest-input';
import type { Menu } from '@/components/dropdown-menu';
import type { Emoji } from '@/features/emoji';
import type { LinkNode } from '@lexical/link';

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: "What's on your mind?" },
  pollPlaceholder: { id: 'compose_form.poll_placeholder', defaultMessage: 'Add a poll topic…' },
  eventPlaceholder: { id: 'compose_form.event_placeholder', defaultMessage: 'Post to this event' },
  publish: { id: 'compose_form.publish', defaultMessage: 'Post' },
  publishLoud: { id: 'compose_form.publish_loud', defaultMessage: '{publish}!' },
  message: { id: 'compose_form.message', defaultMessage: 'Message' },
  schedule: { id: 'compose_form.schedule', defaultMessage: 'Schedule' },
  saveChanges: { id: 'compose_form.save_changes', defaultMessage: 'Save changes' },
  preview: { id: 'compose_form.preview', defaultMessage: 'Preview post' },
  saveDraft: { id: 'compose_form.save_draft', defaultMessage: 'Save draft' },
  draftSaved: { id: 'compose_form.save_draft.success', defaultMessage: 'Draft saved' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  more: { id: 'compose_form.more', defaultMessage: 'More' },
});

interface IComposeButton extends Pick<
  React.ComponentProps<'button'>,
  | 'children'
  | 'disabled'
  | 'onClick'
  | 'onMouseDown'
  | 'onKeyDown'
  | 'onKeyPress'
  | 'title'
  | 'type'
> {
  /** URL to an SVG icon to render inside the button. */
  icon?: string;
  /** Text inside the button. Takes precedence over `children`. */
  text?: React.ReactNode;
  /** Menu items to display as a secondary action. */
  actionsMenu?: Menu;
}

const ComposeButton: React.FC<IComposeButton> = ({
  actionsMenu,
  disabled,
  icon,
  text,
  ...props
}) => {
  const intl = useIntl();

  return (
    <div className='⁂-compose-form__button__container'>
      <button {...props} disabled={disabled} className='⁂-compose-form__button'>
        {icon ? <Icon src={icon} /> : null}
        <span>{text}</span>
      </button>
      <DropdownMenu items={actionsMenu} placement='bottom' disabled={disabled}>
        <button
          className='⁂-compose-form__button__actions'
          title={intl.formatMessage(messages.more)}
        >
          <SvgIcon src={require('@phosphor-icons/core/regular/caret-down.svg')} aria-hidden />
        </button>
      </DropdownMenu>
    </div>
  );
};

interface IComposeForm<ID extends string> {
  id: ID extends 'default' ? never : ID;
  shouldCondense?: boolean;
  autoFocus?: boolean;
  clickableAreaRef?: React.RefObject<HTMLDivElement | null>;
  event?: string;
  group?: string;
  withAvatar?: boolean;
  transparent?: boolean;
  compact?: boolean;
}

const ComposeForm = <ID extends string>({
  id,
  shouldCondense,
  autoFocus,
  clickableAreaRef,
  event,
  group,
  withAvatar,
  transparent,
  compact,
}: IComposeForm<ID>) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { configuration } = useInstance();
  const { closeModal } = useModalsActions();

  const compose = useCompose(id);
  const maxTootChars = configuration.statuses.max_characters;
  const features = useFeatures();
  const persistDraftStatus = usePersistDraftStatus();

  const {
    spoilerText,
    visibility,
    isSubmitting,
    isChangingUpload,
    isUploading,
    scheduledAt,
    groupId,
    text,
    modifiedLanguage,
  } = compose;

  const hasPoll = !!compose.poll;
  const isEditing = compose.editedId !== null;
  const anyMedia = compose.mediaAttachments.length > 0;

  const [composeFocused, setComposeFocused] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<LexicalEditor>(null);

  const { isDraggedOver } = useDraggedFiles(formRef);

  const fulltext = [spoilerText, countableText(text)].join('');

  const isEmpty = !(fulltext.trim() || anyMedia);
  const condensed = shouldCondense && !isDraggedOver && !composeFocused && isEmpty && !isUploading;
  const shouldAutoFocus = autoFocus;
  const canSubmit =
    !!editorRef.current &&
    !isSubmitting &&
    !isUploading &&
    !isChangingUpload &&
    !isEmpty &&
    length(fulltext) <= maxTootChars;

  const getClickableArea = () => (clickableAreaRef ? clickableAreaRef.current : formRef.current);

  const isClickOutside = (e: MouseEvent | React.MouseEvent) =>
    ![
      // List of elements that shouldn't collapse the composer when clicked
      // FIXME: Make this less brittle
      getClickableArea(),
      document.getElementById('privacy-dropdown'),
      document.querySelector('em-emoji-picker'),
      document.getElementById('modal-overlay'),
    ].some((element) => element?.contains(e.target as any));

  const handleClick = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (isEmpty && isClickOutside(e)) {
        handleClickOutside();
      }
    },
    [isEmpty],
  );

  const handleClickOutside = () => {
    setComposeFocused(false);
  };

  const handleComposeFocus = () => {
    setComposeFocused(true);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (!canSubmit) return;
    e?.preventDefault();

    dispatch(
      submitCompose(id, {
        onSuccess: () => {
          editorRef.current?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        },
      }),
    );
  };

  const handlePreview = (e?: React.FormEvent) => {
    e?.preventDefault();

    dispatch(submitCompose(id, {}, true));
  };

  const handleSaveDraft = (e?: React.FormEvent) => {
    e?.preventDefault();

    persistDraftStatus(id);
    closeModal('COMPOSE');
    dispatch(resetCompose(id));
    editorRef.current?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);

    toast.success(messages.draftSaved, {
      actionLabel: messages.view,
      actionLinkOptions: { to: '/draft_statuses' },
    });
  };

  const onSuggestionsClearRequested = () => {
    dispatch(clearComposeSuggestions(id));
  };

  const onSuggestionsFetchRequested = (token: string | number) => {
    dispatch(fetchComposeSuggestions(id, token as string));
  };

  const onSpoilerSuggestionSelected = (
    tokenStart: number,
    token: string | null,
    value: AutoSuggestion,
  ) => {
    dispatch(selectComposeSuggestion(id, tokenStart, token, value, ['spoiler_text']));
  };

  const handleEmojiPick = (data: Emoji) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.update(() => {
      editor.getEditorState()._selection?.insertNodes([$createEmojiNode(data), new TextNode(' ')]);
    });
  };

  const onPaste = (files: FileList) => {
    dispatch(uploadCompose(id, files, intl));
  };

  const onAcceptClearLinkSuggestion = (key: string) => {
    const editor = editorRef.current;
    const suggestion = compose.clearLinkSuggestion;
    if (!editor || !suggestion) return;

    editor.update(() => {
      const node: LinkNode | null = $getNodeByKey(key);
      if (node) {
        node.setURL(suggestion.cleanUrl);
        const children = node.getChildren();
        const textNode = children[0] as TextNode;
        if (
          children.length === 1 &&
          textNode.getType() === 'text' &&
          textNode.getTextContent() === suggestion.originalUrl
        ) {
          textNode.setTextContent(suggestion.cleanUrl);
        }
      }
      dispatch(suggestClearLink(id, null));
    });
  };

  const onRejectClearLinkSuggestion = (key: string) => {
    dispatch(ignoreClearLinkSuggestion(id, key));
  };

  const handleChangeRedactingOverwrite: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    dispatch(changeComposeRedactingOverwrite(id, e.target.checked));
  };

  useEffect(() => {
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.onbeforeunload = null;
    };
  }, []);

  const renderButtons = useCallback(
    () => (
      <div className='⁂-compose-form__buttons'>
        <UploadButtonContainer composeId={id} />
        {features.drive && <DriveButton composeId={id} />}
        <EmojiPickerDropdown onPickEmoji={handleEmojiPick} condensed={shouldCondense} />
        {features.polls && <PollButton composeId={id} />}
        {features.scheduledStatuses && <ScheduleButton composeId={id} />}
        {anyMedia && features.spoilers && <SensitiveMediaButton composeId={id} />}
        {(features.interactionRequests || features.quoteApprovalPolicies) && (
          <InteractionPolicyButton composeId={id} />
        )}
        {features.statusLocation && <LocationButton composeId={id} />}
      </div>
    ),
    [features, id, anyMedia],
  );

  const showModifiers =
    !condensed &&
    (compose.mediaAttachments.length ||
      compose.isUploading ||
      (compose.poll && compose.poll.options.length) ||
      compose.scheduledAt ||
      compose.showLocationPicker);

  const composeModifiers = showModifiers && (
    <div className='⁂-compose-form__modifiers'>
      <UploadForm composeId={id} onSubmit={handleSubmit} />
      <PollForm composeId={id} />
      <ScheduleForm composeId={id} />
      <LocationForm composeId={id} />
    </div>
  );

  let publishText: string | React.JSX.Element = '';
  let publishIcon: string | undefined = undefined;

  if (isEditing) {
    publishText = intl.formatMessage(messages.saveChanges);
  } else if (visibility === 'direct') {
    publishIcon = require('@phosphor-icons/core/regular/at.svg');
    publishText = intl.formatMessage(messages.message);
  } else if (visibility === 'private' || visibility === 'mutuals_only') {
    publishIcon = require('@phosphor-icons/core/regular/lock.svg');
    publishText = intl.formatMessage(messages.publish);
  } else {
    publishText =
      visibility !== 'unlisted'
        ? intl.formatMessage(messages.publishLoud, {
            publish: intl.formatMessage(messages.publish),
          })
        : intl.formatMessage(messages.publish);
  }

  if (scheduledAt) {
    publishText = intl.formatMessage(messages.schedule);
  }

  const selectButtons = [];

  if (features.privacyScopes && !group && !groupId)
    selectButtons.push(<PrivacyDropdown key='privacy-dropdown' composeId={id} compact={compact} />);
  if (features.richText)
    selectButtons.push(
      <ContentTypeButton key='compose-type-button' composeId={id} compact={compact} />,
    );
  if (features.postLanguages)
    selectButtons.push(
      <LanguageDropdown key='language-dropdown' composeId={id} compact={compact} />,
    );

  const actionsMenu: Menu = [];

  if (features.createStatusPreview) {
    actionsMenu.push({
      text: intl.formatMessage(messages.preview),
      action: handlePreview,
      icon: require('@phosphor-icons/core/regular/eye.svg'),
    });
  }

  actionsMenu.push({
    text: intl.formatMessage(messages.saveDraft),
    action: handleSaveDraft,
    icon: require('@phosphor-icons/core/regular/pencil-simple.svg'),
  });

  return (
    <form
      className={clsx('⁂-compose-form', {
        '⁂-compose-form--transparent': transparent,
        '⁂-compose-form--with-avatar': withAvatar,
      })}
      ref={formRef}
      onClick={handleClick}
      onSubmit={handleSubmit}
    >
      {(compose.inReplyToId || compose.quoteId) && compose.approvalRequired && (
        <Warning
          message={
            compose.quoteId ? (
              <FormattedMessage
                id='compose_form.approval_required.quote'
                defaultMessage='The quote needs to be approved by the post author.'
              />
            ) : (
              <FormattedMessage
                id='compose_form.approval_required'
                defaultMessage='The reply needs to be approved by the post author.'
              />
            )
          }
        />
      )}

      <WarningContainer composeId={id} />

      {!shouldCondense && !event && !group && groupId && <ReplyGroupIndicator composeId={id} />}

      {!shouldCondense && !event && !group && <ReplyIndicatorContainer composeId={id} />}

      {!shouldCondense && !event && !group && <ReplyMentions composeId={id} />}

      {selectButtons.length > 0 && (
        <div className='⁂-compose-form__select-buttons'>{selectButtons}</div>
      )}

      {features.spoilers && (
        <SpoilerInput
          composeId={id}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          onSuggestionSelected={onSpoilerSuggestionSelected}
          theme={transparent ? 'transparent' : 'normal'}
        />
      )}

      <div>
        <Suspense>
          <ComposeEditor
            key={modifiedLanguage}
            ref={editorRef}
            className='⁂-compose-form__editor'
            placeholderClassName='⁂-compose-form__editor__placeholder'
            composeId={id}
            condensed={condensed}
            eventDiscussion={!!event}
            autoFocus={shouldAutoFocus}
            hasPoll={hasPoll}
            handleSubmit={handleSubmit}
            onFocus={handleComposeFocus}
            onPaste={onPaste}
          />
        </Suspense>
      </div>

      <ClearLinkSuggestion
        composeId={id}
        handleAccept={onAcceptClearLinkSuggestion}
        handleReject={onRejectClearLinkSuggestion}
      />

      <HashtagCasingSuggestion composeId={id} />

      {composeModifiers}

      <QuotedStatusContainer composeId={id} />

      <PreviewComposeContainer composeId={id} />

      <div
        className={clsx('⁂-compose-form__footer', {
          '⁂-compose-form__footer--condensed': condensed,
        })}
      >
        {renderButtons()}

        <div className='⁂-compose-form__actions'>
          {maxTootChars && (
            <div className='⁂-compose-form__counter'>
              {!compact && <TextCharacterCounter max={maxTootChars} text={text} />}
              <VisualCharacterCounter max={maxTootChars} text={text} />
            </div>
          )}

          <ComposeButton
            type='submit'
            icon={publishIcon}
            text={publishText}
            disabled={!canSubmit}
            actionsMenu={actionsMenu}
          />
        </div>

        {compose.redacting && (
          <List>
            <ListItem
              className='mt-2'
              label={
                <FormattedMessage
                  id='compose.redact.overwrite_label'
                  defaultMessage='Overwrite existing status'
                />
              }
              hint={
                <FormattedMessage
                  id='compose.redact.overwrite_hint'
                  defaultMessage='This will replace the status with a new one, without keeping edit history. The update will not federate.'
                />
              }
            >
              <Toggle
                checked={compose.redactingOverwrite}
                onChange={handleChangeRedactingOverwrite}
              />
            </ListItem>
          </List>
        )}
      </div>
    </form>
  );
};

export { ComposeForm as default };
