import { IconButton, Text, Tooltip, useTheme } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ArrowBendDoubleUpLeftIcon } from 'phosphor-react-native/src/icons/ArrowBendDoubleUpLeft';
import { ArrowBendUpLeftIcon } from 'phosphor-react-native/src/icons/ArrowBendUpLeft';
import { RepeatIcon } from 'phosphor-react-native/src/icons/Repeat';
import { SmileyIcon } from 'phosphor-react-native/src/icons/Smiley';
import { StarIcon } from 'phosphor-react-native/src/icons/Star';
import { ThumbsDownIcon } from 'phosphor-react-native/src/icons/ThumbsDown';
import { ThumbsUpIcon } from 'phosphor-react-native/src/icons/ThumbsUp';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { toast } from 'sonner-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { useFeatures } from '@/contexts/current-account-context';
import { useCanInteract, useInteractionMessages } from '@/hooks/use-can-interact';
import { useReblog } from '@/hooks/use-reblog';
import { useScopeUrl } from '@/hooks/use-scope-url';
import {
  useDislikeStatus,
  useEmojiReactMutation,
  useEmojiUnreactMutation,
  useFavouriteStatus,
  useReblogStatus,
  useUndislikeStatus,
  useUnfavouriteStatus,
  useUnreblogStatus,
} from '@/queries/statuses/use-status-interactions';
import { useComposeActions } from '@/stores/compose';
import { useUiStoreActions } from '@/stores/ui';
import { getSegmentedMenuStyles } from '@/utils/themes';

import { DateTimePicker } from '../ui/date-time-picker';
import { DialogOrSheet } from '../ui/dialog-or-sheet';
import { iconHelper } from '../ui/icon';

import type { SelectedStatus } from '@/queries/statuses/use-status';
import type { TooltipTriggerProps } from '@mkljczk/react-native-paper/lib/typescript/src/components/Tooltip/Tooltip';

const messages = defineMessages({
  reply: { id: 'status.reply', defaultMessage: 'Reply' },
  replyAll: { id: 'status.reply_all', defaultMessage: 'Reply to thread' },
  reblog: { id: 'status.reblog', defaultMessage: 'Repost' },
  unreblog: { id: 'status.unreblog', defaultMessage: 'Unrepost' },
  favourite: { id: 'status.favourite', defaultMessage: 'Like' },
  unfavourite: { id: 'status.unfavourite', defaultMessage: 'Undo like' },
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
  dislike: { id: 'status.dislike', defaultMessage: 'Dislike' },
  undislike: { id: 'status.undislike', defaultMessage: 'Undo dislike' },
  quote: { id: 'status.quote', defaultMessage: 'Quote post' },
  scheduleReblog: { id: 'status.schedule_reblog', defaultMessage: 'Schedule repost' },
  scheduleReblogLabel: { id: 'boost_modal.schedule.label', defaultMessage: 'Schedule at:' },
  scheduledSuccess: {
    id: 'boost_modal.scheduled.success',
    defaultMessage: 'The repost was scheduled',
  },
  scheduledFail: {
    id: 'boost_modal.scheduled.fail',
    defaultMessage: 'Failed to schedule the repost',
  },
  view: { id: 'toast.view', defaultMessage: 'View' },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  schedule: { id: 'compose_form.save_changes', defaultMessage: 'Schedule' },
});

const ReplyAction: React.FC<IStatusActions> = ({ status, fromInteractAs }) => {
  const intl = useIntl();
  const theme = useTheme();
  const { replyCompose } = useComposeActions();
  const { openCompose } = useUiStoreActions();
  const features = useFeatures();

  const scopeUrl = useScopeUrl();

  const interactionTooltip = useInteractionMessages(status, 'can_reply');

  if (fromInteractAs) return null;

  const handleReply = () => {
    replyCompose(status, scopeUrl, features);
    openCompose();
  };

  const renderAction = (props: TooltipTriggerProps) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <IconButton
        icon={iconHelper(status.in_reply_to_id ? ArrowBendDoubleUpLeftIcon : ArrowBendUpLeftIcon)}
        onPress={interactionTooltip ? undefined : handleReply}
        style={{ margin: -4, height: 40, width: 40 }}
        accessibilityLabel={intl.formatMessage(
          status.in_reply_to_id ? messages.replyAll : messages.reply,
        )}
        {...props}
      />
      {status.replies_count > 0 && (
        <Text
          variant='labelMedium'
          style={{
            color: theme.colors.onSurfaceVariant,
          }}
        >
          {status.replies_count}
        </Text>
      )}
    </View>
  );

  if (interactionTooltip) {
    return (
      <Tooltip.Rich title={interactionTooltip.title} content={interactionTooltip.content}>
        {renderAction}
      </Tooltip.Rich>
    );
  }

  return (
    <Tooltip title={intl.formatMessage(status.in_reply_to_id ? messages.replyAll : messages.reply)}>
      {renderAction}
    </Tooltip>
  );
};

interface IScheduleReblog {
  status: SelectedStatus;
  visible: boolean;
  setVisible: (value: boolean) => void;
}

const ScheduleReblog: React.FC<IScheduleReblog> = ({ status, visible, setVisible }) => {
  const intl = useIntl();
  const navigation = useNavigation();
  const theme = useTheme();

  const [scheduledAt, setScheduledAt] = React.useState(() => new Date(Date.now() + 10 * 60 * 1000));
  const [closing, setClosing] = React.useState(false);

  const handleClose = () => setClosing(true);

  const { mutate: reblog } = useReblogStatus(status.id);

  React.useEffect(() => {
    if (closing) setVisible(false);
  }, [closing]);

  return (
    <DialogOrSheet
      title={
        <FormattedMessage
          id='boost_modal.title.scheduled'
          defaultMessage='Schedule repost for later'
        />
      }
      actions={[
        {
          icon: 'xmark',
          label: intl.formatMessage(messages.cancel),
          onPress: () => handleClose(),
        },
        {
          icon: 'checkmark',
          label: intl.formatMessage(messages.schedule),
          onPress: () => {
            reblog(
              {
                scheduledAt: scheduledAt.toISOString(),
              },
              {
                onSuccess: () => {
                  const openedToast = toast.success(intl.formatMessage(messages.scheduledSuccess), {
                    action: {
                      label: intl.formatMessage(messages.view),
                      onClick: () => {
                        toast.dismiss(openedToast);
                        navigation.navigate('scheduled_statuses');
                      },
                    },
                  });
                  setVisible(false);
                },
                onError: (e) => {
                  console.log(e);
                  toast.error(intl.formatMessage(messages.scheduledFail));
                },
              },
            );
          },
          confirm: true,
        },
      ]}
      visible={visible && !closing}
      handleDismiss={() => setVisible(false)}
    >
      <DateTimePicker
        title={intl.formatMessage(messages.scheduleReblogLabel)}
        initialDate={scheduledAt}
        onSelect={setScheduledAt}
        listItemStyle={[getSegmentedMenuStyles(theme, false, 0, 1, 'low'), { marginVertical: 16 }]}
      />
    </DialogOrSheet>
  );
};

const ReblogAction: React.FC<IStatusActions> = ({ status, fromInteractAs }) => {
  const intl = useIntl();
  const theme = useTheme();
  const { quoteCompose } = useComposeActions();
  const { openCompose } = useUiStoreActions();
  const navigation = useNavigation();
  const features = useFeatures();

  const scopeUrl = useScopeUrl();

  const interactionTooltip = useInteractionMessages(status, 'can_reblog');
  const { canInteract: canQuote, approvalRequired } = useCanInteract(status, 'can_quote');
  const doReblog = useReblog(status);

  const { mutate: unreblogStatus } = useUnreblogStatus(status.id);

  const [showScheduleReblog, setShowScheduleReblog] = React.useState(false);

  const publicStatus = ['public', 'unlisted', 'group'].includes(status.visibility);

  const handleReblog = () => {
    if (status.reblogged) unreblogStatus();
    else doReblog();
  };

  const handleQuote = () => {
    quoteCompose(status, scopeUrl, approvalRequired || false);
    openCompose();
  };

  const renderAction = (props: Partial<TooltipTriggerProps>, action?: () => void) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <IconButton
        icon={(props) => <RepeatIcon {...props} weight={status.reblogged ? 'fill' : undefined} />}
        onPress={action || handleReblog}
        disabled={!publicStatus && !status.reblogged}
        style={{ margin: -4, height: 40, width: 40 }}
        selected={status.reblogged}
        accessibilityLabel={intl.formatMessage(
          status.reblogged ? messages.unreblog : messages.reblog,
        )}
        {...props}
        onLongPress={
          !fromInteractAs && status.reblogs_count
            ? () =>
                navigation.navigate('status', {
                  screen: 'reblogs',
                  params: { id: status.id },
                })
            : undefined
        }
      />
      {status.reblogs_count > 0 && (
        <Text
          variant='labelMedium'
          style={{
            color: status.reblogged ? theme.colors.primary : theme.colors.onSurfaceVariant,
          }}
        >
          {status.reblogs_count}
        </Text>
      )}
    </View>
  );

  if (interactionTooltip) {
    return (
      <Tooltip.Rich title={interactionTooltip.title} content={interactionTooltip.content}>
        {renderAction}
      </Tooltip.Rich>
    );
  } else if (features.quotePosts && canQuote && !fromInteractAs) {
    return (
      <>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>{renderAction({}, () => {})}</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item key='reblog' onSelect={handleReblog}>
              <DropdownMenu.ItemIcon
                ios={{ name: status.reblogged ? 'repeat.badge.xmark' : 'repeat' }}
                androidIconName='ph_repeat'
              />
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(status.reblogged ? messages.unreblog : messages.reblog)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
            <DropdownMenu.Item key='quote' onSelect={handleQuote}>
              <DropdownMenu.ItemIcon ios={{ name: 'quote.bubble' }} androidIconName='ph_quotes' />
              <DropdownMenu.ItemTitle>{intl.formatMessage(messages.quote)}</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
            {!features.scheduledReblogs && (
              <DropdownMenu.Item key='schedule-reblog' onSelect={() => setShowScheduleReblog(true)}>
                <DropdownMenu.ItemIcon
                  ios={{ name: 'calendar.badge.plus' }}
                  androidIconName='ph_calendar_plus'
                />
                <DropdownMenu.ItemTitle>
                  {intl.formatMessage(messages.scheduleReblog)}
                </DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        {showScheduleReblog && (
          <ScheduleReblog status={status} visible setVisible={setShowScheduleReblog} />
        )}
      </>
    );
  }

  return (
    <Tooltip title={intl.formatMessage(status.reblogged ? messages.unreblog : messages.reblog)}>
      {renderAction}
    </Tooltip>
  );
};

const FavouriteAction: React.FC<IStatusActions> = ({ status, fromInteractAs }) => {
  const intl = useIntl();
  const theme = useTheme();
  const features = useFeatures();
  const navigation = useNavigation();

  const interactionTooltip = useInteractionMessages(status, 'can_favourite');

  const { mutate: favouriteStatus, isPending: isPendingFavourite } = useFavouriteStatus(status.id);
  const { mutate: unfavouriteStatus } = useUnfavouriteStatus(status.id);

  const renderAction = (props: TooltipTriggerProps) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <IconButton
        icon={(props) => {
          const Icon = features.statusDislikes ? ThumbsUpIcon : StarIcon;
          return <Icon {...props} weight={status.favourited ? 'fill' : undefined} />;
        }}
        onPress={() => (status.favourited ? unfavouriteStatus : favouriteStatus)()}
        disabled={isPendingFavourite}
        style={{ margin: -4, height: 40, width: 40 }}
        selected={status.favourited}
        accessibilityLabel={intl.formatMessage(
          status.favourited ? messages.unfavourite : messages.favourite,
        )}
        {...props}
        onLongPress={
          !fromInteractAs && status.favourites_count
            ? () =>
                navigation.navigate('status', {
                  screen: 'favourites',
                  params: { id: status.id },
                })
            : undefined
        }
      />
      {status.favourites_count > 0 && (
        <Text
          variant='labelMedium'
          style={{
            color: status.favourited ? theme.colors.primary : theme.colors.onSurfaceVariant,
          }}
        >
          {status.favourites_count}
        </Text>
      )}
    </View>
  );

  if (interactionTooltip) {
    return (
      <Tooltip.Rich title={interactionTooltip.title} content={interactionTooltip.content}>
        {renderAction}
      </Tooltip.Rich>
    );
  }

  return (
    <Tooltip
      title={intl.formatMessage(status.favourited ? messages.unfavourite : messages.favourite)}
    >
      {renderAction}
    </Tooltip>
  );
};

const ReactionAction: React.FC<IStatusActions> = ({ status, fromInteractAs }) => {
  const intl = useIntl();
  const features = useFeatures();
  const navigation = useNavigation();
  const scopeUrl = useScopeUrl();

  const { openEmojiPicker } = useUiStoreActions();

  const { mutate: emojiReact, isPending: isPendingReact } = useEmojiReactMutation(status.id);
  const { mutate: emojiUnreact } = useEmojiUnreactMutation(status.id);

  if (!features.emojiReacts) return null;

  const handleReact = () => {
    const selected = status.emoji_reactions
      .filter((reaction) => reaction.me)
      .map((reaction) => reaction.name);

    openEmojiPicker(
      (emoji) => {
        if (selected.includes(emoji)) return emojiUnreact(emoji);
        return emojiReact(emoji);
      },
      selected,
      true,
      features.customEmojiReacts,
      scopeUrl,
    );
  };

  const renderAction = (props: TooltipTriggerProps) => (
    <IconButton
      icon={iconHelper(SmileyIcon)}
      onPress={handleReact}
      disabled={isPendingReact}
      style={{ margin: -4, height: 40, width: 40 }}
      selected={status.favourited}
      accessibilityLabel={intl.formatMessage(messages.emoji)}
      {...props}
      onLongPress={
        !fromInteractAs && status.emoji_reactions.length
          ? () =>
              navigation.navigate('status', {
                screen: 'reactions',
                params: { id: status.id },
              })
          : undefined
      }
    />
  );

  return <Tooltip title={intl.formatMessage(messages.emoji)}>{renderAction}</Tooltip>;
};

const DislikeAction: React.FC<IStatusActions> = ({ status, fromInteractAs }) => {
  const intl = useIntl();
  const theme = useTheme();
  const features = useFeatures();

  const navigation = useNavigation();

  const { mutate: dislikeStatus, isPending: isPendingDislike } = useDislikeStatus(status.id);
  const { mutate: undislikeStatus } = useUndislikeStatus(status.id);

  if (!features.statusDislikes) return null;

  return (
    <Tooltip title={intl.formatMessage(status.disliked ? messages.undislike : messages.dislike)}>
      {(props) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconButton
            icon={(props) => (
              <ThumbsDownIcon {...props} weight={status.disliked ? 'fill' : undefined} />
            )}
            onPress={() => (status.disliked ? undislikeStatus : dislikeStatus)()}
            disabled={isPendingDislike}
            style={{ margin: -4, height: 40, width: 40 }}
            selected={status.disliked}
            accessibilityLabel={intl.formatMessage(
              status.disliked ? messages.undislike : messages.dislike,
            )}
            {...props}
            onLongPress={
              !fromInteractAs && status.dislikes_count
                ? () =>
                    navigation.navigate('status', {
                      screen: 'dislikes',
                      params: { id: status.id },
                    })
                : undefined
            }
          />
          {status.dislikes_count > 0 && (
            <Text
              variant='labelMedium'
              style={{
                color: status.disliked ? theme.colors.primary : theme.colors.onSurfaceVariant,
              }}
            >
              {status.dislikes_count}
            </Text>
          )}
        </View>
      )}
    </Tooltip>
  );
};

interface IStatusActions {
  status: SelectedStatus;
  fromInteractAs?: boolean;
}

const StatusActions: React.FC<IStatusActions> = (props) => (
  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
    <ReplyAction {...props} />
    <ReblogAction {...props} />
    <FavouriteAction {...props} />
    <DislikeAction {...props} />
    <ReactionAction {...props} />
  </View>
);

export { StatusActions, ReblogAction, FavouriteAction, DislikeAction, ReactionAction };
