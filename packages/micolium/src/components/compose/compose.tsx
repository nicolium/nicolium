import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Button, Card, IconButton, Text, TextInput, useTheme } from '@mkljczk/react-native-paper';
import { DragDropContentView, type DragDropContentViewProps } from 'expo-drag-drop-content-view';
import { GlassView } from 'expo-glass-effect';
import { TextInputWrapper } from 'expo-paste-input';
import KeyboardOffIcon from 'lucide-react-native/icons/keyboard-off';
import { AtIcon } from 'phosphor-react-native/src/icons/At';
import { ChartBarIcon } from 'phosphor-react-native/src/icons/ChartBar';
import { PaperPlaneRightIcon } from 'phosphor-react-native/src/icons/PaperPlaneRight';
import { SmileyIcon } from 'phosphor-react-native/src/icons/Smiley';
import { WarningIcon } from 'phosphor-react-native/src/icons/Warning';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import {
  ScrollView,
  TextInput as RNTextInput,
  View,
  Platform,
  Keyboard,
  type TextInputSelectionChangeEvent,
} from 'react-native';
import { useKeyboardState } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFeatures, useInstance } from '@/contexts/current-account-context';
import { useComposeHeading } from '@/hooks/use-compose-heading';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import { Alert } from '@/stores/alerts';
import { useAuthStore } from '@/stores/auth';
import {
  checkComposeContent,
  useCompose,
  useComposeActions,
  useComposeStore,
  newPoll,
  useSubmitCompose,
  useUploadCompose,
} from '@/stores/compose';
import { useSetting } from '@/stores/settings';
import { useIsComposeOpen, useUiStore, useUiStoreActions } from '@/stores/ui';
import { textAtCursorMatchesToken } from '@/utils/suggestions';

import { Account } from '../accounts/account';
import { GlassActionButton } from '../ui/dialog-or-sheet';
import { iconHelper } from '../ui/icon';

import { ComposeAttachmentThumbs } from './compose-attachment-thumbs';
import { ComposeContentTypeButton } from './compose-content-type-button';
import { ComposeGifPickerButton } from './compose-gif-picker';
import { ComposeInteractionPolicy } from './compose-interaction-policy';
import { ComposeLanguageDropdown } from './compose-language-dropdown';
import { ComposePollForm } from './compose-poll-form';
import { ComposeQuoteIndicator } from './compose-quote-indicator';
import { ComposeReplyIndicator } from './compose-reply-indicator';
import { ComposeScheduleButton } from './compose-schedule-button';
import { ComposeScheduleForm } from './compose-schedule-form';
import { ComposeSuggestions } from './compose-suggestions';
import { ComposeUploadButton } from './compose-upload-button';
import { ComposeVisibilityDropdown } from './compose-visibility-dropdown';

import type { Suggestion } from '@/hooks/use-compose-suggestions';
import type { SFSymbol } from 'expo-symbols';

const COMPOSE_ID = 'compose-modal' as const;

const SEARCH_TOKENS = ['@', ':', '#'] as const;

const getStartPosition = (suggestion: Suggestion, tokenStart: number) =>
  typeof suggestion === 'object' || suggestion[0] === '#' ? tokenStart - 1 : tokenStart;

type SuggestionField = 'text' | 'spoiler_text';

interface SuggestionToken {
  field: SuggestionField;
  tokenStart: number;
  token: string;
}

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: 'What’s on your mind?' },
  spoilerPlaceholder: {
    id: 'compose_form.spoiler.placeholder',
    defaultMessage: 'Subject (optional)',
  },
  addPoll: { id: 'poll_button.add_poll', defaultMessage: 'Add a poll' },
  removePoll: { id: 'poll_button.remove_poll', defaultMessage: 'Remove poll' },
  marked: { id: 'compose_form.sensitive.marked', defaultMessage: 'Media is marked as sensitive' },
  unmarked: {
    id: 'compose_form.sensitive.unmarked',
    defaultMessage: 'Media is not marked as sensitive',
  },
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
  publish: { id: 'compose_form.publish', defaultMessage: 'Post' },
  publishReply: { id: 'compose_form.reply', defaultMessage: 'Reply' },
  publishQuote: { id: 'compose_form.quote', defaultMessage: 'Quote' },
  publishDirect: { id: 'compose_form.direct', defaultMessage: 'Direct' },
  publishChanges: { id: 'compose_form.save_changes.short', defaultMessage: 'Edit' },
  schedule: { id: 'compose_form.save_changes', defaultMessage: 'Schedule' },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  cancelConfirmationConfirm: { id: 'confirmations.cancel.confirm', defaultMessage: 'Discard' },
  cancelConfirmationHeading: { id: 'confirmations.cancel.heading', defaultMessage: 'Discard post' },
  cancelConfirmationMessage: {
    id: 'confirmations.cancel.message',
    defaultMessage: 'Are you sure you want to discard the currently composed post?',
  },
  cancelEditingConfirmationConfirm: {
    id: 'confirmations.cancel_editing.confirm',
    defaultMessage: 'Cancel editing',
  },
  cancelEditingConfirmationHeading: {
    id: 'confirmations.cancel_editing.heading',
    defaultMessage: 'Cancel post editing',
  },
  cancelEditingConfirmationMessage: {
    id: 'confirmations.cancel_editing.message',
    defaultMessage:
      'Are you sure you want to discard the changes to this post? All changes will be lost.',
  },
  close: { id: 'common.close', defaultMessage: 'Close' },
  missingDescriptionModalTitle: {
    id: 'missing_description_modal.text',
    defaultMessage: 'You have not entered a description for all attachments. Continue anyway?',
  },
  missingDescriptionModalMessage: {
    id: 'missing_desription_modal.description',
    defaultMessage: 'Continue anyway?',
  },
  missingDescriptionModalConfirm: {
    id: 'missing_description_modal.continue',
    defaultMessage: 'Post',
  },
  hideKeyboard: { id: 'compose_form.hide_keyboard', defaultMessage: 'Hide keyboard' },
  success: { id: 'compose.submit.success', defaultMessage: 'Your post was sent!' },
  editSuccess: { id: 'compose.edit.success', defaultMessage: 'Your post was edited' },
  scheduledSuccess: { id: 'compose.scheduled.success', defaultMessage: 'Your post was scheduled' },
});

const MaybeDragDropContentView: React.FC<DragDropContentViewProps> = (props) => {
  if (Platform.OS === 'ios') return <DragDropContentView {...props} />;

  return props.children;
};

interface ICompose {
  composeId: string;
}

const useComposeText = () => {
  const compose = useCompose(COMPOSE_ID);

  let { text, spoilerText } = compose;
  const { language, modifiedLanguage } = compose;

  if (modifiedLanguage && modifiedLanguage !== language) {
    text = compose.textMap[modifiedLanguage];
    spoilerText = compose.spoilerTextMap[modifiedLanguage];
  }

  return { text, spoilerText };
};

const useComposePublish = () => {
  const intl = useIntl();
  const compose = useCompose(COMPOSE_ID);
  const { closeCompose } = useUiStoreActions();
  const submitCompose = useSubmitCompose(COMPOSE_ID);
  const { configuration } = useInstance();
  const missingDescriptionModal = useSetting('compose.missingDescriptionModal');
  const { text, spoilerText } = useComposeText();

  const { isSubmitting, inReplyToId, quoteId, visibility, poll } = compose;

  const textLength = (spoilerText + text).length;
  const maxLength = configuration.statuses.max_characters;

  const disabled =
    (!text.trim().length && !compose.mediaAttachments.length) ||
    (!!poll && poll.options.some((option) => !option.trim().length)) ||
    compose.isUploading ||
    compose.isChangingUpload ||
    textLength > maxLength;

  const handlePublish = () => {
    const doPublish = () =>
      submitCompose({
        onSuccess: () => closeCompose(),
      });

    const hasMissingDescriptions = compose.mediaAttachments.some((item) => !item.description);
    if (missingDescriptionModal && hasMissingDescriptions) {
      return Alert.alert(
        intl.formatMessage(messages.missingDescriptionModalTitle),
        intl.formatMessage(messages.missingDescriptionModalMessage),
        [
          {
            text: intl.formatMessage(messages.cancel),
            style: 'cancel',
          },
          {
            text: intl.formatMessage(messages.missingDescriptionModalConfirm),
            onPress: doPublish,
          },
        ],
      );
    }

    doPublish();
  };

  const publishButtonLabel = intl.formatMessage(
    compose.scheduledAt
      ? compose.scheduledStatusId
        ? messages.publishChanges
        : messages.schedule
      : compose.editedId
        ? messages.publishChanges
        : inReplyToId
          ? messages.publishReply
          : quoteId
            ? messages.publishQuote
            : visibility === 'direct'
              ? messages.publishDirect
              : messages.publish,
  );

  const publishButtonSfIcon: SFSymbol = visibility === 'direct' ? 'at' : 'paperplane';
  const publishButtonIcon = visibility === 'direct' ? AtIcon : PaperPlaneRightIcon;

  return {
    handlePublish,
    disabled: disabled || isSubmitting,
    isSubmitting,
    textLength,
    maxLength,
    publishButtonLabel,
    publishButtonSfIcon,
    publishButtonIcon,
  };
};

interface IComposeHeader {
  onClose: () => void;
}

const ComposeHeader: React.FC<IComposeHeader> = ({ onClose }) => {
  const intl = useIntl();
  const heading = useComposeHeading(COMPOSE_ID);
  const { handlePublish, disabled, publishButtonLabel, publishButtonSfIcon } = useComposePublish();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
      }}
    >
      <GlassActionButton
        icon='xmark'
        label={intl.formatMessage(messages.close)}
        onPress={onClose}
      />
      <Text variant='titleMedium'>{heading}</Text>
      <GlassActionButton
        icon={publishButtonSfIcon}
        label={publishButtonLabel}
        onPress={handlePublish}
        confirm
        disabled={disabled}
      />
    </View>
  );
};

interface IComposeFooter {
  suggestionToken: SuggestionToken | null;
  onSuggestionSelected: (suggestion: Suggestion) => void;
  onHeightChange: (height: number) => void;
}

const ComposeFooter: React.FC<IComposeFooter> = ({
  suggestionToken,
  onSuggestionSelected,
  onHeightChange,
}) => {
  const intl = useIntl();
  const glassEffect = useEnableLiquidGlass();
  const { colors } = useTheme();
  const features = useFeatures();
  const compose = useCompose(COMPOSE_ID);
  const { updateCompose } = useComposeActions();
  const { openEmojiPicker } = useUiStoreActions();
  const isKeyboardVisible = useKeyboardState((state) => state.isVisible);
  const {
    handlePublish,
    disabled,
    isSubmitting,
    textLength,
    maxLength,
    publishButtonLabel,
    publishButtonIcon,
  } = useComposePublish();

  const [showKeyboardButton, setShowKeyboardButton] = React.useState(isKeyboardVisible);

  const { poll, sensitive } = compose;

  React.useEffect(() => {
    if (isKeyboardVisible) setShowKeyboardButton(true);
  }, [isKeyboardVisible]);

  const handleInsertEmoji = () => {
    openEmojiPicker((emoji, custom) => {
      updateCompose(COMPOSE_ID, (draft) => {
        const insertedText = custom ? `:${emoji}:` : emoji;

        if (draft.modifiedLanguage) {
          draft.textMap[draft.modifiedLanguage] =
            (draft.textMap[draft.modifiedLanguage] || '') + insertedText;
        } else {
          draft.text += insertedText;
        }
      });
    });
  };

  const footerContent = (
    <ScrollView
      horizontal
      contentContainerStyle={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: glassEffect ? 4 : 8,
        paddingHorizontal: 12,
      }}
    >
      <ComposeUploadButton composeId={COMPOSE_ID} />
      {features.gifPicker && <ComposeGifPickerButton composeId={COMPOSE_ID} />}
      {features.polls && (
        <IconButton
          icon={iconHelper(ChartBarIcon)}
          style={{ marginHorizontal: 0 }}
          mode={poll ? 'contained' : undefined}
          selected={!!poll}
          onPress={() =>
            updateCompose(COMPOSE_ID, (draft) => {
              draft.poll = draft.poll ? null : newPoll();
            })
          }
          disabled={compose.mediaAttachments.length > 0 || compose.isUploading}
          accessibilityLabel={intl.formatMessage(poll ? messages.removePoll : messages.addPoll)}
        />
      )}
      {compose.mediaAttachments.length > 0 && (
        <IconButton
          icon={iconHelper(WarningIcon)}
          style={{ marginHorizontal: 0 }}
          mode={sensitive ? 'contained' : undefined}
          selected={sensitive}
          onPress={() =>
            updateCompose(COMPOSE_ID, (draft) => {
              draft.sensitive = !draft.sensitive;
            })
          }
          accessibilityLabel={intl.formatMessage(sensitive ? messages.marked : messages.unmarked)}
        />
      )}
      {(features.interactionRequests || features.quoteApprovalPolicies) && (
        <ComposeInteractionPolicy composeId={COMPOSE_ID} />
      )}
      <IconButton
        icon={iconHelper(SmileyIcon)}
        style={{ marginHorizontal: 0 }}
        onPress={handleInsertEmoji}
        accessibilityLabel={intl.formatMessage(messages.emoji)}
      />
      <ComposeContentTypeButton composeId={COMPOSE_ID} />
      {features.scheduledStatuses && <ComposeScheduleButton composeId={COMPOSE_ID} />}
      <View style={{ flexGrow: 1 }} />
      {Platform.OS === 'ios' && showKeyboardButton && (
        <IconButton
          icon={(props) => <KeyboardOffIcon {...props} strokeWidth={1.75} />}
          style={{ marginHorizontal: 0 }}
          onPress={() => {
            Keyboard.dismiss();
            setShowKeyboardButton(false);
          }}
          accessibilityLabel={intl.formatMessage(messages.hideKeyboard)}
        />
      )}
      <Text
        variant='labelLargeEmphasized'
        style={{
          marginHorizontal: 8,
          color: textLength > maxLength ? colors.error : colors.onBackground,
        }}
      >
        {maxLength - textLength}
      </Text>
      {!glassEffect && (
        <Button
          mode='contained'
          icon={iconHelper(publishButtonIcon)}
          onPress={handlePublish}
          loading={isSubmitting}
          disabled={disabled}
        >
          {publishButtonLabel}
        </Button>
      )}
    </ScrollView>
  );

  return (
    <>
      <ComposeSuggestions
        token={suggestionToken?.token ?? ''}
        handleSelected={onSuggestionSelected}
      />
      {glassEffect ? (
        <GlassView
          onLayout={(e) => onHeightChange(e.nativeEvent.layout.height)}
          style={{
            marginHorizontal: 12,
            borderRadius: 28,
            borderCurve: 'continuous',
          }}
        >
          {footerContent}
        </GlassView>
      ) : (
        <View
          onLayout={(e) => onHeightChange(e.nativeEvent.layout.height)}
          style={{
            backgroundColor: colors.secondaryContainer,
          }}
        >
          {footerContent}
        </View>
      )}
    </>
  );
};

interface IComposeBody {
  scrollableRef: React.RefObject<ScrollView | null>;
  footerHeight: number;
  suggestionToken: SuggestionToken | null;
  onSuggestionTokenChange: (suggestionToken: SuggestionToken | null) => void;
  textRefs: Record<SuggestionField, React.RefObject<string>>;
  caretPositionRefs: Record<SuggestionField, React.RefObject<number>>;
}

const ComposeBody: React.FC<IComposeBody> = ({
  scrollableRef,
  footerHeight,
  suggestionToken,
  onSuggestionTokenChange,
  textRefs,
  caretPositionRefs,
}) => {
  const intl = useIntl();
  const { colors, fonts } = useTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const features = useFeatures();
  const compose = useCompose(COMPOSE_ID);
  const { updateCompose } = useComposeActions();
  const uploadCompose = useUploadCompose(COMPOSE_ID);
  const { configuration } = useInstance();
  const { data: currentAccountId } = useCredentialAccountId();
  const { text, spoilerText } = useComposeText();

  const checkSuggestionToken = (field: SuggestionField) => {
    const [tokenStart, token] = textAtCursorMatchesToken(
      textRefs[field].current,
      caretPositionRefs[field].current,
      SEARCH_TOKENS,
    );

    if (token && token[0] === '@' && token.match(/:.+/)) {
      onSuggestionTokenChange(null);
    } else if (
      token !== null &&
      (suggestionToken?.token !== token || suggestionToken.field !== field)
    ) {
      onSuggestionTokenChange({ field, tokenStart: tokenStart!, token });
    } else if (token === null) {
      onSuggestionTokenChange(null);
    }
  };

  const handleChangeText = (text: string) => {
    textRefs.text.current = text;
    checkSuggestionToken('text');

    updateCompose(COMPOSE_ID, (draft) => {
      if (!draft.modifiedLanguage || draft.modifiedLanguage === draft.language) {
        draft.text = text;
      } else {
        draft.textMap[draft.modifiedLanguage] = text;
      }
    });
  };

  const handleSelectionChange = (e: TextInputSelectionChangeEvent) => {
    caretPositionRefs.text.current = e.nativeEvent.selection.start;
    checkSuggestionToken('text');
  };

  const handleChangeSpoilerText = (text: string) => {
    textRefs.spoiler_text.current = text;
    checkSuggestionToken('spoiler_text');

    updateCompose(COMPOSE_ID, (draft) => {
      if (!draft.modifiedLanguage || draft.modifiedLanguage === draft.language) {
        draft.spoilerText = text;
      } else {
        draft.spoilerTextMap[draft.modifiedLanguage] = text;
      }
    });
  };

  const handleSpoilerSelectionChange = (e: TextInputSelectionChangeEvent) => {
    caretPositionRefs.spoiler_text.current = e.nativeEvent.selection.start;
    checkSuggestionToken('spoiler_text');
  };

  return (
    <ScrollView
      ref={scrollableRef}
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        gap: 8,
        paddingHorizontal: 12,
        paddingBottom: footerHeight + bottomInset,
      }}
    >
      <MaybeDragDropContentView
        allowedMimeTypes={configuration.media_attachments.supported_mime_types}
        onDrop={(event) => {
          uploadCompose(
            event.assets
              .filter((asset) => asset.uri)
              .slice(
                0,
                configuration.statuses.max_media_attachments - compose.mediaAttachments.length,
              )
              .map((asset) => ({
                uri: asset.uri!,
                name: asset.uri!.split('/').at(-1)!,
                type: asset.type,
                size: 0,
              })),
          );
        }}
        style={{ flexGrow: 1, gap: 8 }}
      >
        {currentAccountId && (
          <View style={{ flexDirection: 'row' }}>
            <Account
              id={currentAccountId}
              action={
                <View style={{ gap: 8, alignItems: 'flex-end' }}>
                  {features.privacyScopes && <ComposeVisibilityDropdown composeId={COMPOSE_ID} />}
                  {features.postLanguages && <ComposeLanguageDropdown composeId={COMPOSE_ID} />}
                </View>
              }
            />
          </View>
        )}
        <ComposeReplyIndicator composeId={COMPOSE_ID} />
        <ComposeQuoteIndicator composeId={COMPOSE_ID} />
        {compose.approvalRequired && (
          <Card mode='outlined'>
            <Text style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              {compose.quoteId ? (
                <FormattedMessage
                  id='compose_form.approval_required.quote'
                  defaultMessage='The quote needs to be approved by the post author.'
                />
              ) : (
                <FormattedMessage
                  id='compose_form.approval_required'
                  defaultMessage='The reply needs to be approved by the post author.'
                />
              )}
            </Text>
          </Card>
        )}
        {features.spoilers && (
          <TextInput
            value={spoilerText}
            onChangeText={handleChangeSpoilerText}
            onSelectionChange={handleSpoilerSelectionChange}
            variant='outlined'
            placeholder={intl.formatMessage(messages.spoilerPlaceholder)}
          />
        )}
        <TextInputWrapper
          onPaste={(payload) => {
            if (payload.type === 'images') {
              uploadCompose(
                payload.uris
                  .slice(
                    0,
                    configuration.statuses.max_media_attachments - compose.mediaAttachments.length,
                  )
                  .map((uri) => ({
                    uri,
                    name: uri.split('/').at(-1)!,
                    type: 'application/octet-stream',
                    size: 0,
                  })),
              );
            }
          }}
          style={{
            flexGrow: 1,
          }}
        >
          <RNTextInput
            value={text}
            onChangeText={handleChangeText}
            onSelectionChange={handleSelectionChange}
            placeholder={intl.formatMessage(messages.placeholder)}
            scrollEnabled={false}
            style={{
              flexGrow: 1,
              minHeight: 40,
              alignSelf: 'stretch',
              paddingHorizontal: 16 + 1,
              color: colors.onSurface,
              textAlignVertical: 'top',
              ...fonts.bodyLarge,
            }}
            multiline
          />
        </TextInputWrapper>
        <ComposePollForm composeId={COMPOSE_ID} />
        <ComposeScheduleForm composeId={COMPOSE_ID} />
        <ComposeAttachmentThumbs composeId={COMPOSE_ID} />
      </MaybeDragDropContentView>
    </ScrollView>
  );
};

const ComposeBottomSheet = () => {
  const intl = useIntl();
  const glassEffect = useEnableLiquidGlass();
  const { colors } = useTheme();
  const isComposeOpen = useIsComposeOpen();
  const [isPresented, setIsPresented] = React.useState(isComposeOpen);
  const [footerHeight, setFooterHeight] = React.useState(0);
  const [suggestionToken, setSuggestionToken] = React.useState<SuggestionToken | null>(null);
  const { closeCompose, openCompose } = useUiStoreActions();
  const { resetCompose, selectComposeSuggestion } = useComposeActions();
  const scopeUrl = useScopeUrl();

  const bottomSheetRef = React.useRef<TrueSheet>(null);
  const scrollableRef = React.useRef<ScrollView>(null);

  const textRefs = {
    text: React.useRef(''),
    spoiler_text: React.useRef(''),
  };
  const caretPositionRefs = {
    text: React.useRef(0),
    spoiler_text: React.useRef(0),
  };

  const handleSuggestionSelected = (suggestion: Suggestion) => {
    if (!suggestionToken) return;

    const { field, tokenStart, token } = suggestionToken;

    selectComposeSuggestion(
      COMPOSE_ID,
      scopeUrl,
      getStartPosition(suggestion, tokenStart),
      token,
      suggestion,
      [field],
    );
    setSuggestionToken(null);

    const compose = useComposeStore.getState().composers[COMPOSE_ID];
    const modifiedLanguage =
      compose.modifiedLanguage && compose.modifiedLanguage !== compose.language
        ? compose.modifiedLanguage
        : null;

    if (field === 'spoiler_text') {
      textRefs.spoiler_text.current = modifiedLanguage
        ? compose.spoilerTextMap[modifiedLanguage]
        : compose.spoilerText;
    } else {
      textRefs.text.current = modifiedLanguage ? compose.textMap[modifiedLanguage] : compose.text;
    }
  };

  const handleClose = React.useCallback(() => {
    const compose = useComposeStore.getState().composers[COMPOSE_ID];

    if (checkComposeContent(compose)) {
      const editing = !!compose.editedId;

      Alert.alert(
        intl.formatMessage(
          editing ? messages.cancelEditingConfirmationHeading : messages.cancelConfirmationHeading,
        ),
        intl.formatMessage(
          editing ? messages.cancelEditingConfirmationMessage : messages.cancelConfirmationMessage,
        ),
        [
          {
            text: intl.formatMessage(messages.cancel),
            style: 'cancel',
            onPress: () => openCompose(),
          },
          {
            text: intl.formatMessage(
              editing
                ? messages.cancelEditingConfirmationConfirm
                : messages.cancelConfirmationConfirm,
            ),
            style: 'destructive',
            onPress: () => resetCompose(COMPOSE_ID),
          },
        ],
      );
    } else {
      resetCompose(COMPOSE_ID);
    }

    closeCompose();
  }, []);

  React.useEffect(() => {
    if (isComposeOpen) {
      setIsPresented(true);
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isComposeOpen]);

  const handleDismiss = () => {
    setIsPresented(false);
    if (useUiStore.getState().isComposeOpen) {
      handleClose();
    }
  };

  return (
    <TrueSheet
      ref={bottomSheetRef}
      detents={[0.85]}
      header={isPresented && glassEffect ? <ComposeHeader onClose={handleClose} /> : undefined}
      footer={
        isPresented ? (
          <ComposeFooter
            suggestionToken={suggestionToken}
            onSuggestionSelected={handleSuggestionSelected}
            onHeightChange={setFooterHeight}
          />
        ) : undefined
      }
      footerOptions={{ position: 'absolute', keyboardOffset: 12 }}
      onDidDismiss={handleDismiss}
      scrollableRef={scrollableRef}
      style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 16 : 32 }}
      backgroundColor={glassEffect ? undefined : colors.surfaceContainer}
    >
      {isPresented && (
        <ComposeBody
          scrollableRef={scrollableRef}
          footerHeight={footerHeight}
          suggestionToken={suggestionToken}
          onSuggestionTokenChange={setSuggestionToken}
          textRefs={textRefs}
          caretPositionRefs={caretPositionRefs}
        />
      )}
    </TrueSheet>
  );
};

const MaybeComposeBottomSheet = () => {
  const isLoggedIn = useAuthStore(({ currentAccount }) => !!currentAccount);

  return isLoggedIn ? <ComposeBottomSheet /> : null;
};

export { MaybeComposeBottomSheet as ComposeBottomSheet, type ICompose };
