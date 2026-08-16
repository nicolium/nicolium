import iconAt from '@phosphor-icons/core/regular/at.svg';
import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconEye from '@phosphor-icons/core/regular/eye.svg';
import iconLock from '@phosphor-icons/core/regular/lock.svg';
import iconPencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import clsx from 'clsx';
import { $getNodeByKey, CLEAR_EDITOR_COMMAND, TextNode, type LexicalEditor } from 'lexical';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { length } from 'stringz';

import { ComposeEditor } from '@/components/async-components';
import DropdownMenu from '@/components/dropdown-menu';
import List, { ListItem } from '@/components/list';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import SvgIcon from '@/components/ui/svg-icon';
import Toggle from '@/components/ui/toggle';
import { useColumnId } from '@/contexts/deck-column-id-context';
import EmojiPickerDropdown from '@/emoji/containers/emoji-picker-dropdown-container';
import { useComposeAutosave } from '@/hooks/use-compose-autosave';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useFeatures } from '@/hooks/use-features';
import { usePersistDraftStatus } from '@/queries/statuses/use-draft-statuses';
import {
  useCompose,
  useComposeActions,
  useComposeContentType,
  useThread,
  useUploadCompose,
  useSubmitCompose,
  useSubmitThread,
} from '@/stores/compose';
import { useInstance } from '@/stores/instance';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';
import { isServo } from '@/utils/browser';

import ClearLinkSuggestion from './clear-link-suggestion';
import ComposeAccountSwitcher from './compose-account-switcher';
import ContentTypeButton from './content-type-button';
import DriveButton from './drive-button';
import { $createEmojiNode } from './editor/nodes/emoji-node';
import GifPickerButton from './gif-picker-button';
import HashtagCasingSuggestion from './hashtag-casing-suggestion';
import InteractionPolicyButton from './interaction-policy-button';
import LanguageDropdown from './language-dropdown';
import LocationButton from './location-button';
import LocationForm from './location-form';
import PlainTextEditor, { type PlainTextEditorHandle } from './plain-text-editor';
import PollButton from './poll-button';
import PollForm from './polls/poll-form';
import PreviewComposeContainer from './preview-compose-container';
import PrivacyDropdown from './privacy-dropdown';
import QuotedStatusContainer from './quoted-status-container';
import ReplyGroupIndicator from './reply-group-indicator';
import ReplyIndicatorContainer from './reply-indicator-container';
import ReplyMentions from './reply-mentions';
import ScheduleButton from './schedule-button';
import ScheduleForm from './schedule-form';
import SensitiveMediaButton from './sensitive-media-button';
import SpoilerInput from './spoiler-input';
import TextCharacterCounter from './text-character-counter';
import UploadButtonContainer from './upload-button-container';
import UploadForm from './upload-form';
import { countableText } from './util/counter';
import VisualCharacterCounter from './visual-character-counter';
import Warning from './warning';
import WarningContainer from './warning-container';

import type { Menu } from '@/components/dropdown-menu';
import type { Emoji } from '@/emoji';
import type { LinkNode } from '@lexical/link';

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: 'What’s on your mind?' },
  preview: { id: 'compose_form.preview', defaultMessage: 'Preview post' },
  saveDraft: { id: 'compose_form.save_draft', defaultMessage: 'Save draft' },
  draftSaved: { id: 'compose_form.save_draft.success', defaultMessage: 'Draft saved' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  more: { id: 'compose_form.more', defaultMessage: 'More' },
  addThreadPost: { id: 'compose_form.thread.add', defaultMessage: 'Add another post' },
  removeThreadPost: { id: 'compose_form.thread.remove', defaultMessage: 'Remove post' },
  threadPlaceholder: { id: 'compose_form.thread.placeholder', defaultMessage: 'Add another post…' },
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
    <div className='compose-form__send-button__container'>
      <button {...props} disabled={disabled} className='compose-form__send-button'>
        {icon ? <Icon src={icon} /> : null}
        <span>{text}</span>
      </button>
      <DropdownMenu items={actionsMenu} placement='bottom' disabled={disabled}>
        <button
          className='compose-form__send-button__actions'
          title={intl.formatMessage(messages.more)}
        >
          <SvgIcon src={iconCaretDown} aria-hidden />
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
  fullScreen?: boolean;
  group?: string;
  onAutosave?: () => void;
  onSubmit?: () => void;
  withAvatar?: boolean;
  transparent?: boolean;
  compact?: boolean;
  showAccountSwitcher?: boolean;
  // Keep the avatars always visible.
  expandAccountSwitcher?: boolean;
  enableThread?: boolean;
  threadItem?: boolean;
  onRemove?: () => void;
  onThreadSubmit?: () => void;
}

const ComposeForm = <ID extends string>({
  id,
  shouldCondense,
  autoFocus,
  clickableAreaRef,
  event,
  fullScreen,
  group,
  onAutosave,
  onSubmit,
  withAvatar,
  transparent,
  compact,
  showAccountSwitcher,
  expandAccountSwitcher,
  enableThread,
  threadItem,
  onRemove,
  onThreadSubmit,
}: IComposeForm<ID>) => {
  const intl = useIntl();
  const { configuration } = useInstance();
  const { closeModal } = useModalsActions();
  const actions = useComposeActions();
  const { renderMfm } = useSettings();
  const columnId = useColumnId();

  const compose = useCompose(id);
  const uploadCompose = useUploadCompose(id);
  const submitCompose = useSubmitCompose(id);
  const submitThread = useSubmitThread(id);
  const thread = useThread(id);
  const maxTootChars = configuration.statuses.max_characters;
  const features = useFeatures();
  const persistDraftStatus = usePersistDraftStatus();

  const isThreadRoot = !threadItem;
  const hasThread = isThreadRoot && thread.length > 0;

  useComposeAutosave(id, !threadItem, onAutosave);

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
  const contentType = useComposeContentType(id);

  const hasPoll = !!compose.poll;
  const isEditing = compose.editedId !== null;
  const anyMedia = compose.mediaAttachments.length > 0;

  const [composeFocused, setComposeFocused] = useState(false);

  const usePlainText = isServo;

  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<LexicalEditor>(null);
  const plainTextRef = useRef<PlainTextEditorHandle>(null);

  const { isDraggedOver } = useDraggedFiles(formRef);

  const fulltext = [spoilerText, countableText(text)].join('');

  const isEmpty = !(fulltext.trim() || anyMedia);
  const condensed = shouldCondense && !isDraggedOver && !composeFocused && isEmpty && !isUploading;
  const shouldAutoFocus = autoFocus;
  const canSubmit =
    !isSubmitting &&
    !isUploading &&
    !isChangingUpload &&
    !isEmpty &&
    length(fulltext) <= maxTootChars;

  const clearEditor = () => {
    if (usePlainText) {
      plainTextRef.current?.clear();
    } else {
      editorRef.current?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
    }
  };

  const getClickableArea = () => (clickableAreaRef ? clickableAreaRef.current : formRef.current);

  const isClickOutside = (e: MouseEvent | React.MouseEvent) =>
    ![
      // List of elements that shouldn't collapse the composer when clicked
      // FIXME: Make this less brittle
      getClickableArea(),
      document.getElementById('privacy-dropdown'),
      document.querySelector('em-emoji-picker'),
      document.getElementById('modal-overlay'),
    ].some((element) => element?.contains(e.target as Node));

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
    e?.preventDefault();

    if (threadItem) {
      onThreadSubmit?.();
      return;
    }

    if (!canSubmit) return;

    if (hasThread) {
      submitThread({
        onSuccess: () => {
          clearEditor();
          if (onSubmit) {
            setTimeout(() => onSubmit(), 0);
          }
        },
        columnId,
      });
      return;
    }

    submitCompose({
      propagate: fullScreen,
      onSuccess: () => {
        clearEditor();
        if (onSubmit) {
          setTimeout(() => onSubmit(), 0);
        }
      },
      columnId,
    });
  };

  const handleAddThreadPost = () => {
    actions.addThreadPost(id);
  };

  const handlePreview = (e?: React.FormEvent) => {
    e?.preventDefault();

    submitCompose({ preview: true });
  };

  const handleSaveDraft = (e?: React.FormEvent) => {
    e?.preventDefault();

    persistDraftStatus(id);
    closeModal('COMPOSE');
    actions.resetCompose(id);
    clearEditor();

    toast.success(messages.draftSaved, {
      actionLabel: messages.view,
      actionLinkOptions: { to: '/draft_statuses' },
      columnId,
    });
  };

  const handleEmojiPick = (data: Emoji) => {
    if (usePlainText) {
      plainTextRef.current?.insertEmoji(data);
      return;
    }

    const editor = editorRef.current;
    if (!editor) return;

    editor.update(() => {
      editor.getEditorState()._selection?.insertNodes([$createEmojiNode(data), new TextNode(' ')]);
    });
  };

  const onPaste = (files: FileList) => {
    uploadCompose(files);
  };

  const onAcceptClearLinkSuggestion = (key: string) => {
    const editor = editorRef.current;
    const suggestion = compose.clearLinkSuggestion;
    if (!editor || !suggestion) return;

    editor.update(() => {
      const node = $getNodeByKey(key) as LinkNode | null;
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
      actions.updateCompose(id, (draft) => {
        draft.clearLinkSuggestion = null;
      });
    });
  };

  const onRejectClearLinkSuggestion = (key: string) => {
    actions.updateCompose(id, (draft) => {
      if (draft.clearLinkSuggestion?.key === key) {
        draft.clearLinkSuggestion = null;
      }
      draft.dismissedClearLinksSuggestions.push(key);
    });
  };

  const handleChangeRedactingOverwrite: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    actions.updateCompose(id, (draft) => {
      draft.redactingOverwrite = e.target.checked;
    });
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
      <div className='compose-form__buttons'>
        <UploadButtonContainer composeId={id} />
        {features.drive && <DriveButton composeId={id} />}
        {features.gifPicker && <GifPickerButton composeId={id} />}
        <EmojiPickerDropdown onPickEmoji={handleEmojiPick} condensed={shouldCondense} />
        {features.polls && <PollButton composeId={id} />}
        {features.scheduledStatuses && !hasThread && !threadItem && (
          <ScheduleButton composeId={id} />
        )}
        {anyMedia && features.spoilers && <SensitiveMediaButton composeId={id} />}
        {(features.interactionRequests || features.quoteApprovalPolicies) && (
          <InteractionPolicyButton composeId={id} />
        )}
        {features.statusLocation && <LocationButton composeId={id} />}
      </div>
    ),
    [features, id, anyMedia, hasThread, thread.length],
  );

  const showModifiers =
    !condensed &&
    (compose.mediaAttachments.length ||
      compose.isUploading ||
      (compose.poll && compose.poll.options.length) ||
      compose.scheduledAt ||
      compose.showLocationPicker);

  const composeModifiers = showModifiers && (
    <div className='compose-form__modifiers'>
      <UploadForm composeId={id} onSubmit={handleSubmit} />
      <PollForm composeId={id} />
      <ScheduleForm composeId={id} />
      <LocationForm composeId={id} />
    </div>
  );

  let publishText: string | React.JSX.Element = '';
  let publishIcon: string | undefined = undefined;

  if (isEditing) {
    publishText = <FormattedMessage id='compose_form.save_changes' defaultMessage='Save changes' />;
  } else if (visibility === 'direct') {
    publishIcon = iconAt;
    publishText = <FormattedMessage id='compose_form.message' defaultMessage='Message' />;
  } else if (visibility === 'private' || visibility === 'mutuals_only') {
    publishIcon = iconLock;
    publishText = <FormattedMessage id='compose_form.publish' defaultMessage='Post' />;
  } else {
    publishText =
      visibility !== 'unlisted' ? (
        <FormattedMessage
          id='compose_form.publish_loud'
          defaultMessage='{publish}!'
          values={{ publish: <FormattedMessage id='compose_form.publish' defaultMessage='Post' /> }}
        />
      ) : (
        <FormattedMessage id='compose_form.publish' defaultMessage='Post' />
      );
  }

  if (scheduledAt) {
    publishText = <FormattedMessage id='compose_form.schedule' defaultMessage='Schedule' />;
  }

  if (hasThread) {
    publishText = (
      <FormattedMessage
        id='compose_form.publish_thread'
        defaultMessage='Post all {count}'
        values={{ count: thread.length + 1 }}
      />
    );
    publishIcon = undefined;
  }

  const selectButtons = [];

  if (features.privacyScopes && !group && !groupId)
    selectButtons.push(<PrivacyDropdown key='privacy-dropdown' composeId={id} compact={compact} />);
  if (features.richText)
    selectButtons.push(
      <ContentTypeButton key='compose-type-button' composeId={id} compact={compact} />,
    );
  if (features.postLanguages)
    selectButtons.push(<LanguageDropdown key='language-dropdown' composeId={id} />);

  const actionsMenu: Menu = [];

  if (features.createStatusPreview || (renderMfm && contentType === 'text/x.misskeymarkdown')) {
    actionsMenu.push({
      text: intl.formatMessage(messages.preview),
      action: handlePreview,
      icon: iconEye,
    });
  }

  actionsMenu.push({
    text: intl.formatMessage(messages.saveDraft),
    action: handleSaveDraft,
    icon: iconPencilSimple,
  });

  if (!scheduledAt && (maxTootChars > 1024 || !enableThread) && !hasThread) {
    actionsMenu.push({
      text: intl.formatMessage(messages.addThreadPost),
      action: handleAddThreadPost,
      icon: iconPlus,
    });
  }

  const Wrapper: React.ElementType = threadItem ? 'div' : 'form';
  const wrapperProps: Record<string, any> = threadItem
    ? {}
    : { ref: formRef, onClick: handleClick, onSubmit: handleSubmit };

  const threadPlaceholder = threadItem ? intl.formatMessage(messages.threadPlaceholder) : undefined;

  const composeButton = (
    <ComposeButton
      type='submit'
      icon={publishIcon}
      text={publishText}
      disabled={!canSubmit}
      actionsMenu={actionsMenu}
    />
  );

  const composeFooter = (
    <div
      className={clsx('compose-form__footer', {
        'compose-form__footer--condensed': condensed,
      })}
    >
      {renderButtons()}
      <div className='compose-form__actions'>
        {maxTootChars && (
          <div className='compose-form__counter'>
            {!compact && <TextCharacterCounter max={maxTootChars} text={fulltext} />}
            <VisualCharacterCounter max={maxTootChars} text={fulltext} />
          </div>
        )}

        {threadItem ? (
          <IconButton
            src={iconX}
            type='button'
            className='compose-form__thread-remove'
            aria-label={intl.formatMessage(messages.removeThreadPost)}
            title={intl.formatMessage(messages.removeThreadPost)}
            onClick={onRemove}
            theme='secondary'
          />
        ) : (
          !hasThread && composeButton
        )}
      </div>

      {compose.redacting && !threadItem && (
        <List>
          <ListItem
            className='compose-form__redact'
            label={
              <FormattedMessage
                id='compose.redact.overwrite.label'
                defaultMessage='Overwrite existing post'
              />
            }
            hint={
              <FormattedMessage
                id='compose.redact.overwrite.hint'
                defaultMessage='This will replace the post with a new one, without keeping edit history. The update will not federate.'
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
  );

  const addThreadPostButton = !scheduledAt && (
    <button type='button' className='compose-form__thread-add' onClick={handleAddThreadPost}>
      <Icon src={iconPlus} />
      <FormattedMessage id='compose_form.thread.add' defaultMessage='Add another post' />
    </button>
  );

  return (
    <Wrapper
      className={clsx('compose-form', {
        'compose-form--transparent': transparent,
        'compose-form--with-avatar': withAvatar,
        'compose-form--thread-item': threadItem,
      })}
      {...wrapperProps}
    >
      {!threadItem && (compose.inReplyToId || compose.quoteId) && compose.approvalRequired && (
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

      {!threadItem && <WarningContainer composeId={id} />}

      {showAccountSwitcher && !shouldCondense && !group && !threadItem && (
        <ComposeAccountSwitcher composeId={id} expanded={expandAccountSwitcher} />
      )}

      {!event && !group && !threadItem && groupId && <ReplyGroupIndicator composeId={id} />}

      {!event && !group && !threadItem && <ReplyIndicatorContainer composeId={id} />}

      {!event && !group && !threadItem && <ReplyMentions composeId={id} />}

      {selectButtons.length > 0 && !threadItem && (
        <div className='compose-form__select-buttons'>{selectButtons}</div>
      )}

      {features.spoilers && !threadItem && (
        <SpoilerInput composeId={id} theme={transparent ? 'transparent' : 'normal'} />
      )}

      <div>
        <Suspense fallback={<div className='compose-form__editor-placeholder' />}>
          {usePlainText ? (
            <PlainTextEditor
              key={modifiedLanguage}
              ref={plainTextRef}
              className='compose-form__editor'
              composeId={id}
              condensed={condensed}
              eventDiscussion={!!event}
              autoFocus={shouldAutoFocus}
              hasPoll={hasPoll}
              handleSubmit={handleSubmit}
              onFocus={handleComposeFocus}
              onPaste={onPaste}
              placeholder={threadPlaceholder}
            />
          ) : (
            <ComposeEditor
              key={modifiedLanguage}
              ref={editorRef}
              className='compose-form__editor'
              placeholderClassName='compose-form__editor__placeholder'
              composeId={id}
              condensed={condensed}
              eventDiscussion={!!event}
              autoFocus={shouldAutoFocus}
              hasPoll={hasPoll}
              handleSubmit={handleSubmit}
              onFocus={handleComposeFocus}
              onPaste={onPaste}
              placeholder={threadPlaceholder}
            />
          )}
        </Suspense>
      </div>

      <ClearLinkSuggestion
        composeId={id}
        handleAccept={onAcceptClearLinkSuggestion}
        handleReject={onRejectClearLinkSuggestion}
      />

      <HashtagCasingSuggestion composeId={id} />

      {composeModifiers}

      {!threadItem && <QuotedStatusContainer composeId={id} />}

      {!threadItem && <PreviewComposeContainer composeId={id} />}

      {hasThread && composeFooter}

      {isThreadRoot &&
        (thread?.length > 0 ||
          (enableThread && !hasThread && maxTootChars <= 1024 && addThreadPostButton)) && (
          <div className='compose-form__thread'>
            {thread.map((childId) => (
              <ComposeForm
                key={childId}
                id={childId}
                threadItem
                transparent={transparent}
                onRemove={() => actions.removeThreadPost(id, childId)}
                onThreadSubmit={handleSubmit}
              />
            ))}
            {enableThread && !hasThread && maxTootChars <= 1024 && addThreadPostButton}
          </div>
        )}

      {!hasThread ? (
        composeFooter
      ) : (
        <div
          className={clsx('compose-form__compose-actions', {
            'compose-form__compose-actions--sticky': hasThread && id === 'compose-modal',
          })}
        >
          {addThreadPostButton}
          {composeButton}
        </div>
      )}
    </Wrapper>
  );
};

export { ComposeForm as default };
