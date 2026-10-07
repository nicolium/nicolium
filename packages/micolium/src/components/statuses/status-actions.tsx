import { IconButton, Text, Tooltip, useTheme } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowBendDoubleUpLeftIcon,
  ArrowBendUpLeftIcon,
  RepeatIcon,
  StarIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from 'phosphor-react-native';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { View } from 'react-native';

import { useFeatures } from '@/contexts/current-account-context';
import { useCanInteract, useInteractionMessages } from '@/hooks/use-can-interact';
import { useScopeUrl } from '@/hooks/use-scope-url';
import {
  useDislikeStatus,
  useFavouriteStatus,
  useReblogStatus,
  useUndislikeStatus,
  useUnfavouriteStatus,
  useUnreblogStatus,
} from '@/queries/statuses/use-status-interactions';
import { useComposeActions } from '@/stores/compose';
import { useUiStoreActions } from '@/stores/ui';

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
  dislike: { id: 'status.dislike', defaultMessage: 'Dislike' },
  undislike: { id: 'status.undislike', defaultMessage: 'Undo dislike' },
});

const ReplyAction: React.FC<IStatusActions> = ({ status }) => {
  const intl = useIntl();
  const theme = useTheme();
  const { replyCompose } = useComposeActions();
  const { openCompose } = useUiStoreActions();

  const scopeUrl = useScopeUrl();

  const interactionTooltip = useInteractionMessages(status, 'can_reply');

  const handleReply = () => {
    replyCompose(status, scopeUrl);
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

const ReblogAction: React.FC<IStatusActions> = ({ status }) => {
  const intl = useIntl();
  const theme = useTheme();
  const navigation = useNavigation();

  const interactionTooltip = useInteractionMessages(status, 'can_reblog');

  const { mutate: reblogStatus, isPending: isPendingReblog } = useReblogStatus(status.id);
  const { mutate: unreblogStatus } = useUnreblogStatus(status.id);

  const publicStatus = ['public', 'unlisted', 'group'].includes(status.visibility);

  const renderAction = (props: TooltipTriggerProps) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <IconButton
        icon={(props) => <RepeatIcon {...props} weight={status.reblogged ? 'fill' : undefined} />}
        onPress={() => (status.reblogged ? unreblogStatus() : reblogStatus({}))}
        onLongPress={
          status.reblogs_count
            ? () =>
                navigation.navigate('status', {
                  screen: 'reblogs',
                  params: { id: status.id },
                })
            : undefined
        }
        disabled={isPendingReblog || !publicStatus}
        style={{ margin: -4, height: 40, width: 40 }}
        selected={status.reblogged}
        accessibilityLabel={intl.formatMessage(
          status.reblogged ? messages.unreblog : messages.reblog,
        )}
        {...props}
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
  }

  return (
    <Tooltip title={intl.formatMessage(status.reblogged ? messages.unreblog : messages.reblog)}>
      {renderAction}
    </Tooltip>
  );
};

const FavouriteAction: React.FC<IStatusActions> = ({ status }) => {
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
        onLongPress={
          status.favourites_count
            ? () =>
                navigation.navigate('status', {
                  screen: 'favourites',
                  params: { id: status.id },
                })
            : undefined
        }
        disabled={isPendingFavourite}
        style={{ margin: -4, height: 40, width: 40 }}
        selected={status.favourited}
        accessibilityLabel={intl.formatMessage(
          status.favourited ? messages.unfavourite : messages.favourite,
        )}
        {...props}
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

const DislikeAction: React.FC<IStatusActions> = ({ status }) => {
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
            onLongPress={
              status.dislikes_count
                ? () =>
                    navigation.navigate('status', {
                      screen: 'dislikes',
                      params: { id: status.id },
                    })
                : undefined
            }
            disabled={isPendingDislike}
            style={{ margin: -4, height: 40, width: 40 }}
            selected={status.disliked}
            accessibilityLabel={intl.formatMessage(
              status.disliked ? messages.undislike : messages.dislike,
            )}
            {...props}
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
}

const StatusActions: React.FC<IStatusActions> = ({ status }) => (
  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
    <ReplyAction status={status} />
    <ReblogAction status={status} />
    <FavouriteAction status={status} />
    <DislikeAction status={status} />
  </View>
);

export { StatusActions };
