import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import {
  ActivityIndicator,
  Card,
  Icon,
  IconButton,
  SplitButton,
  Text,
  TextInput,
  useTheme,
} from '@mkljczk/react-native-paper';
import {
  ArrowBendUpLeftIcon,
  CalendarPlusIcon,
  ChartBarIcon,
  PaperclipIcon,
  PaperPlaneRightIcon,
  QuotesIcon,
  SmileyIcon,
  XIcon,
} from 'phosphor-react-native';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Alert, BackHandler, View } from 'react-native';
import { useKeyboardState } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFeatures } from '@/contexts/current-account-context';
import { useCredentialAccount } from '@/queries/accounts/use-account-credentials';
import { useStatus } from '@/queries/statuses/use-status';
import {
  checkComposeContent,
  useCompose,
  useComposeActions,
  useComposeStore,
  useSubmitCompose,
} from '@/stores/compose';
import { useIsComposeOpen, useUiStoreActions } from '@/stores/ui';
import { BottomSheetBackdrop } from '@/utils/themes';

import { Account } from './accounts/account';
import { Status } from './statuses/status';
import { iconHelper } from './ui/icon';

const COMPOSE_ID = 'compose-modal' as const;

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: 'What’s on your mind?' },
  spoilerPlaceholder: {
    id: 'compose_form.spoiler.placeholder',
    defaultMessage: 'Subject (optional)',
  },
  upload: { id: 'upload_button.label', defaultMessage: 'Add media attachment' },
  addPoll: { id: 'poll_button.add_poll', defaultMessage: 'Add a poll' },
  removePoll: { id: 'poll_button.remove_poll', defaultMessage: 'Remove poll' },
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
  schedule: { id: 'schedule.post_time', defaultMessage: 'Post date/time' },
  removeSchedule: { id: 'schedule.remove', defaultMessage: 'Remove schedule' },
  publish: { id: 'compose_form.publish', defaultMessage: 'Post' },
  publishReply: { id: 'compose_form.reply', defaultMessage: 'Reply' },
  publishQuote: { id: 'compose_form.quote', defaultMessage: 'Quote' },
  publishDirect: { id: 'compose_form.direct', defaultMessage: 'Direct' },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  cancelConfirmationConfirm: { id: 'confirmations.cancel.confirm', defaultMessage: 'Discard' },
  cancelConfirmationHeading: { id: 'confirmations.cancel.heading', defaultMessage: 'Discard post' },
  cancelConfirmationMessage: {
    id: 'confirmations.cancel.message',
    defaultMessage: 'Are you sure you want to discard the currently composed post?',
  },
});

interface ICompose {
  composeId?: string;
}

const ReplyIndicator: React.FC<ICompose> = ({ composeId = COMPOSE_ID }) => {
  const { inReplyToId } = useCompose(composeId);
  const { updateCompose } = useComposeActions();
  const { data: status, isPending } = useStatus(inReplyToId || undefined);

  if (!status) return null;

  return (
    <View style={{ gap: 4 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Icon source={iconHelper(ArrowBendUpLeftIcon)} size={20} />
        <Text style={{ flex: 1 }}>
          <FormattedMessage
            id='compose.reply_indicator'
            defaultMessage='Reply to @{acct}'
            values={{ acct: status.account.acct }}
          />
        </Text>
        <IconButton
          icon={iconHelper(XIcon)}
          style={{ margin: 0 }}
          onPress={() =>
            updateCompose(COMPOSE_ID, (draft) => {
              draft.inReplyToId = null;
            })
          }
        />
      </View>
      <Card mode='outlined'>
        {isPending ? (
          <ActivityIndicator />
        ) : (
          <Status id={inReplyToId!} compact withActions={false} textOnly />
        )}
      </Card>
    </View>
  );
};

const QuoteIndicator: React.FC<ICompose> = ({ composeId = COMPOSE_ID }) => {
  const { quoteId } = useCompose(composeId);
  const { updateCompose } = useComposeActions();
  const { data: status, isPending } = useStatus(quoteId || undefined);

  if (!status) return null;

  return (
    <View style={{ gap: 4 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Icon source={iconHelper(QuotesIcon)} size={20} />
        <Text style={{ flex: 1 }}>
          <FormattedMessage
            id='compose.quote_indicator'
            defaultMessage='Quoting @{acct}'
            values={{ acct: status.account.acct }}
          />
        </Text>
        <IconButton
          icon={iconHelper(XIcon)}
          style={{ margin: 0 }}
          onPress={() =>
            updateCompose(COMPOSE_ID, (draft) => {
              draft.quoteId = null;
            })
          }
        />
      </View>
      <Card mode='outlined'>
        {isPending ? (
          <ActivityIndicator />
        ) : (
          <Status id={quoteId!} compact withActions={false} textOnly />
        )}
      </Card>
    </View>
  );
};

const ComposeBottomSheet = () => {
  const intl = useIntl();
  const { colors, fonts } = useTheme();
  const keyboardState = useKeyboardState();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const isComposeOpen = useIsComposeOpen();
  const { closeCompose, openCompose } = useUiStoreActions();
  const features = useFeatures();
  const compose = useCompose(COMPOSE_ID);
  const { updateCompose, resetCompose } = useComposeActions();
  const submitCompose = useSubmitCompose(COMPOSE_ID);

  const { text, spoilerText, isSubmitting, inReplyToId, quoteId, visibility } = compose;

  const { data: currentAccount } = useCredentialAccount();

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  const disabled = !text.trim().length;

  const handleClose = React.useCallback(() => {
    const compose = useComposeStore.getState().composers[COMPOSE_ID];

    if (checkComposeContent(compose)) {
      Alert.alert(
        intl.formatMessage(messages.cancelConfirmationHeading),
        intl.formatMessage(messages.cancelConfirmationMessage),
        [
          {
            text: intl.formatMessage(messages.cancel),
            style: 'cancel',
            onPress: () => openCompose(),
          },
          {
            text: intl.formatMessage(messages.cancelConfirmationConfirm),
            style: 'destructive',
            onPress: () => resetCompose(COMPOSE_ID),
          },
        ],
      );
    } else {
      resetCompose(COMPOSE_ID);
    }

    closeCompose();
    return true;
  }, [isComposeOpen]);

  React.useEffect(() => {
    if (isComposeOpen) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.close();
    }
  }, [isComposeOpen]);

  React.useEffect(() => {
    if (isComposeOpen) {
      const { remove } = BackHandler.addEventListener('hardwareBackPress', handleClose);
      return remove;
    }
  }, [handleClose]);

  const handleAnimate = (fromIndex: number, toIndex: number) => {
    if (fromIndex === 0 && toIndex === -1) {
      handleClose();
    }
  };

  const publishButtonLabel = intl.formatMessage(
    inReplyToId
      ? messages.publishReply
      : quoteId
        ? messages.publishQuote
        : visibility === 'direct'
          ? messages.publishDirect
          : messages.publish,
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      backgroundStyle={{ backgroundColor: colors.surfaceContainer }}
      handleIndicatorStyle={{ backgroundColor: colors.onSurface }}
      backdropComponent={(props) => <BottomSheetBackdrop {...props} onPress={handleClose} />}
      snapPoints={['100%']}
      enableDynamicSizing={false}
      topInset={topInset + 64}
      enablePanDownToClose={true}
      onAnimate={handleAnimate}
      onDismiss={closeCompose}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, gap: 8 }}>
          <BottomSheetScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, gap: 8, paddingHorizontal: 12 }}
            keyboardShouldPersistTaps='handled'
          >
            <View style={{ flexDirection: 'row' }}>
              <Account id={currentAccount?.id} />
            </View>
            <ReplyIndicator />
            <QuoteIndicator />
            {features.spoilers && (
              <TextInput
                value={spoilerText}
                onChangeText={(text) =>
                  updateCompose(COMPOSE_ID, (draft) => {
                    draft.spoilerText = text;
                  })
                }
                variant='outlined'
                placeholder={intl.formatMessage(messages.spoilerPlaceholder)}
              />
            )}
            <BottomSheetTextInput
              value={text}
              onChangeText={(text) =>
                updateCompose(COMPOSE_ID, (draft) => {
                  draft.text = text;
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
          </BottomSheetScrollView>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 12,
              paddingBottom: keyboardState.isVisible ? 8 : bottomInset + 8,
              backgroundColor: colors.secondaryContainer,
            }}
          >
            <IconButton
              icon={iconHelper(PaperclipIcon)}
              style={{ marginHorizontal: 0 }}
              onPress={() => {}}
              disabled
              accessibilityLabel={intl.formatMessage(messages.upload)}
            />
            <IconButton
              icon={iconHelper(ChartBarIcon)}
              style={{ marginHorizontal: 0 }}
              onPress={() => {}}
              disabled
              accessibilityLabel={intl.formatMessage(messages.addPoll)}
            />
            <IconButton
              icon={iconHelper(SmileyIcon)}
              style={{ marginHorizontal: 0 }}
              onPress={() => {}}
              disabled
              accessibilityLabel={intl.formatMessage(messages.emoji)}
            />
            <IconButton
              icon={iconHelper(CalendarPlusIcon)}
              style={{ marginHorizontal: 0 }}
              onPress={() => {}}
              disabled
              accessibilityLabel={intl.formatMessage(messages.schedule)}
            />
            <SplitButton
              icon={iconHelper(PaperPlaneRightIcon)}
              label={publishButtonLabel}
              style={{ marginLeft: 'auto' }}
              onPress={() =>
                submitCompose({
                  onSuccess: closeCompose,
                })
              }
              loading={isSubmitting}
              disabled={disabled || isSubmitting}
            />
          </View>
        </View>
      </View>
    </BottomSheetModal>
  );
};

export { ComposeBottomSheet };
