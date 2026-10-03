import { IconButton, Text, Tooltip, useTheme } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowBendDoubleUpLeftIcon,
  ArrowBendUpLeftIcon,
  RepeatIcon,
  StarIcon,
} from 'phosphor-react-native';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { View } from 'react-native';

import { useStatus } from '@/queries/statuses/use-status';
import {
  useFavouriteStatus,
  useReblogStatus,
  useUnfavouriteStatus,
  useUnreblogStatus,
} from '@/queries/statuses/use-status-interactions';

import { iconHelper } from '../ui/icon';

const messages = defineMessages({
  reply: { id: 'status.reply', defaultMessage: 'Reply' },
  replyAll: { id: 'status.reply_all', defaultMessage: 'Reply to thread' },
  reblog: { id: 'status.reblog', defaultMessage: 'Repost' },
  unreblog: { id: 'status.unreblog', defaultMessage: 'Unrepost' },
  favourite: { id: 'status.favourite', defaultMessage: 'Like' },
  unfavourite: { id: 'status.unfavourite', defaultMessage: 'Undo like' },
});

interface IStatusActions {
  id: string;
}

const StatusActions: React.FC<IStatusActions> = ({ id }) => {
  const intl = useIntl();
  const theme = useTheme();

  const navigation = useNavigation();

  const { data: status } = useStatus(id);

  const { mutate: favouriteStatus, isPending: isPendingFavourite } = useFavouriteStatus(id);
  const { mutate: unfavouriteStatus } = useUnfavouriteStatus(id);
  const { mutate: reblogStatus, isPending: isPendingReblog } = useReblogStatus(id);
  const { mutate: unreblogStatus } = useUnreblogStatus(id);

  if (!status) return null;

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
      <Tooltip
        title={intl.formatMessage(status.in_reply_to_id ? messages.replyAll : messages.reply)}
      >
        {(props) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <IconButton
              {...props}
              icon={iconHelper(
                status.in_reply_to_id ? ArrowBendDoubleUpLeftIcon : ArrowBendUpLeftIcon,
              )}
              onPress={() => {}}
              style={{ margin: -4, height: 40, width: 40 }}
              accessibilityLabel={intl.formatMessage(
                status.in_reply_to_id ? messages.replyAll : messages.reply,
              )}
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
        )}
      </Tooltip>
      <Tooltip title={intl.formatMessage(status.reblogged ? messages.unreblog : messages.reblog)}>
        {(props) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <IconButton
              {...props}
              icon={(props) => (
                <RepeatIcon {...props} weight={status.reblogged ? 'fill' : undefined} />
              )}
              onPress={() => (status.reblogged ? unreblogStatus() : reblogStatus({}))}
              onLongPress={() =>
                navigation.navigate(
                  'status' as never,
                  { screen: 'reblogs', params: { id } } as never,
                )
              }
              disabled={isPendingReblog}
              style={{ margin: -4, height: 40, width: 40 }}
              selected={status.reblogged}
              accessibilityLabel={intl.formatMessage(
                status.reblogged ? messages.unreblog : messages.reblog,
              )}
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
        )}
      </Tooltip>
      <Tooltip
        title={intl.formatMessage(status.favourited ? messages.unfavourite : messages.favourite)}
      >
        {(props) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <IconButton
              {...props}
              icon={(props) => (
                <StarIcon {...props} weight={status.favourited ? 'fill' : undefined} />
              )}
              onPress={() => (status.favourited ? unfavouriteStatus : favouriteStatus)()}
              disabled={isPendingFavourite}
              style={{ margin: -4, height: 40, width: 40 }}
              selected={status.favourited}
              accessibilityLabel={intl.formatMessage(
                status.favourited ? messages.unfavourite : messages.favourite,
              )}
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
        )}
      </Tooltip>
    </View>
  );
};

export { StatusActions };
