import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Button, IconButton, Text, TextInput, useTheme } from '@mkljczk/react-native-paper';
import { DragDropContentView } from 'expo-drag-drop-content-view';
import { GlassView } from 'expo-glass-effect';
import { TextInputWrapper } from 'expo-paste-input';
import { AtIcon } from 'phosphor-react-native/src/icons/At';
import { ChartBarIcon } from 'phosphor-react-native/src/icons/ChartBar';
import { PaperPlaneRightIcon } from 'phosphor-react-native/src/icons/PaperPlaneRight';
import { SmileyIcon } from 'phosphor-react-native/src/icons/Smiley';
import { WarningIcon } from 'phosphor-react-native/src/icons/Warning';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Alert, ScrollView, TextInput as RNTextInput, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFeatures, useInstance } from '@/contexts/current-account-context';
import { useComposeHeading } from '@/hooks/use-compose-heading';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
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

import { Account } from '../accounts/account';
import { GlassActionButton } from '../ui/dialog-or-sheet';
import { iconHelper } from '../ui/icon';

import { ComposeAttachmentThumbs } from './compose-attachment-thumbs';
import { ComposeInteractionPolicy } from './compose-interaction-policy';
import { ComposeLanguageDropdown } from './compose-language-dropdown';
import { ComposeQuoteIndicator } from './compose-quote-indicator';
import { ComposeReplyIndicator } from './compose-reply-indicator';
import { ComposeScheduleButton } from './compose-schedule-button';
import { ComposeScheduleForm } from './compose-schedule-form';
import { ComposeUploadButton } from './compose-upload-button';
import { ComposeVisibilityDropdown } from './compose-visibility-dropdown';
import { PollForm } from './poll-form';

import type { SFSymbol } from 'expo-symbols';

const COMPOSE_ID = 'compose-modal' as const;

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
});

interface ICompose {
  composeId: string;
}

const ComposeBottomSheet = () => {
  const intl = useIntl();
  const glassEffect = useEnableLiquidGlass();
  const { colors, fonts } = useTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const isComposeOpen = useIsComposeOpen();
  const { closeCompose, openCompose } = useUiStoreActions();
  const features = useFeatures();
  const compose = useCompose(COMPOSE_ID);
  const { updateCompose, resetCompose } = useComposeActions();
  const submitCompose = useSubmitCompose(COMPOSE_ID);
  const { openEmojiPicker } = useUiStoreActions();
  const heading = useComposeHeading(COMPOSE_ID);
  const uploadCompose = useUploadCompose(COMPOSE_ID);
  const { configuration } = useInstance();

  const missingDescriptionModal = useSetting('compose.missingDescriptionModal');

  let { text, spoilerText } = compose;
  const {
    isSubmitting,
    inReplyToId,
    quoteId,
    visibility,
    poll,
    sensitive,
    language,
    modifiedLanguage,
  } = compose;

  if (modifiedLanguage && modifiedLanguage !== language) {
    text = compose.textMap[modifiedLanguage];
    spoilerText = compose.spoilerTextMap[modifiedLanguage];
  }

  const { data: currentAccountId } = useCredentialAccountId();

  const bottomSheetRef = React.useRef<TrueSheet>(null);
  const scrollableRef = React.useRef<ScrollView>(null);

  const textLength = (spoilerText + text).length;
  const maxLength = configuration.statuses.max_characters;

  const disabled =
    (!text.trim().length && !compose.mediaAttachments.length) ||
    (!!poll && poll.options.some((option) => !option.trim().length)) ||
    compose.isUploading ||
    compose.isChangingUpload ||
    textLength > maxLength;

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
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isComposeOpen]);

  const handlePublish = () => {
    const doPublish = () =>
      submitCompose({
        onSuccess: closeCompose,
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

  const handleDismiss = () => {
    if (useUiStore.getState().isComposeOpen) {
      handleClose();
    }
  };

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

  const headerContent = glassEffect ? (
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
        onPress={() => handleClose()}
      />
      <Text variant='titleMedium'>{heading}</Text>
      <GlassActionButton
        icon={publishButtonSfIcon}
        label={publishButtonLabel}
        onPress={handlePublish}
        confirm
        disabled={disabled || isSubmitting}
      />
    </View>
  ) : undefined;

  const footerContent = (
    <>
      <ComposeUploadButton composeId={COMPOSE_ID} />
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
      {features.scheduledStatuses && <ComposeScheduleButton composeId={COMPOSE_ID} />}
      <View style={{ flexGrow: 1 }} />
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
          disabled={disabled || isSubmitting}
        >
          {publishButtonLabel}
        </Button>
      )}
    </>
  );

  const footer = glassEffect ? (
    <GlassView
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginHorizontal: 12,
        borderRadius: 32,
        paddingHorizontal: 12,
        paddingVertical: 4,
      }}
    >
      {footerContent}
    </GlassView>
  ) : (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.secondaryContainer,
      }}
    >
      {footerContent}
    </View>
  );

  return (
    <TrueSheet
      ref={bottomSheetRef}
      detents={[0.85]}
      header={headerContent}
      footer={footer}
      footerOptions={{ keyboardOffset: -bottomInset }}
      onDidDismiss={handleDismiss}
      scrollableRef={scrollableRef}
      style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 16 : 32 }}
      backgroundColor={glassEffect ? undefined : colors.surfaceContainer}
    >
      <ScrollView
        ref={scrollableRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 12 }}
      >
        <DragDropContentView
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
          <ComposeReplyIndicator composeId={COMPOSE_ID} />
          <ComposeQuoteIndicator composeId={COMPOSE_ID} />
          {features.spoilers && (
            <TextInput
              value={spoilerText}
              onChangeText={(text) =>
                updateCompose(COMPOSE_ID, (draft) => {
                  if (!draft.modifiedLanguage || draft.modifiedLanguage === draft.language) {
                    draft.spoilerText = text;
                  } else {
                    draft.spoilerTextMap[draft.modifiedLanguage] = text;
                  }
                })
              }
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
                      configuration.statuses.max_media_attachments -
                        compose.mediaAttachments.length,
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
              onChangeText={(text) =>
                updateCompose(COMPOSE_ID, (draft) => {
                  if (!draft.modifiedLanguage || draft.modifiedLanguage === draft.language) {
                    draft.text = text;
                  } else {
                    draft.textMap[draft.modifiedLanguage] = text;
                  }
                })
              }
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
          <PollForm composeId={COMPOSE_ID} />
          <ComposeScheduleForm composeId={COMPOSE_ID} />
          <ComposeAttachmentThumbs composeId={COMPOSE_ID} />
        </DragDropContentView>
      </ScrollView>
    </TrueSheet>
  );
};

const MaybeComposeBottomSheet = () => {
  const isLoggedIn = useAuthStore(({ currentAccount }) => !!currentAccount);

  return isLoggedIn ? <ComposeBottomSheet /> : null;
};

export { MaybeComposeBottomSheet as ComposeBottomSheet, type ICompose };
