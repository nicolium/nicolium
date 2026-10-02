import {
  ArrowBendDoubleUpLeftIcon,
  ArrowBendUpLeftIcon,
  DotsThreeVerticalIcon,
  RepeatIcon,
  StarIcon,
} from 'phosphor-react-native';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { View } from 'react-native';
import { IconButton, Tooltip } from 'react-native-paper';

import { useStatus } from '@/queries/statuses/use-status';
import {
  useFavouriteStatus,
  useReblogStatus,
  useUnfavouriteStatus,
  useUnreblogStatus,
} from '@/queries/statuses/use-status-interactions';

import { Account } from '../account';
import { iconHelper } from '../ui/icon';
import { UIStatus } from '../ui/status';

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

  const { data: status } = useStatus(id);

  const { mutate: favouriteStatus, isPending: isPendingFavourite } = useFavouriteStatus(id);
  const { mutate: unfavouriteStatus } = useUnfavouriteStatus(id);
  const { mutate: reblogStatus, isPending: isPendingReblog } = useReblogStatus(id);
  const { mutate: unreblogStatus } = useUnreblogStatus(id);

  if (!status) return null;

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Tooltip
        title={intl.formatMessage(status.in_reply_to_id ? messages.replyAll : messages.reply)}
      >
        <IconButton
          icon={iconHelper(status.in_reply_to_id ? ArrowBendDoubleUpLeftIcon : ArrowBendUpLeftIcon)}
          onPress={() => {}}
          style={{ margin: -4, marginTop: 0, height: 40, width: 40 }}
          accessibilityLabel={intl.formatMessage(
            status.in_reply_to_id ? messages.replyAll : messages.reply,
          )}
        />
      </Tooltip>
      <IconButton
        icon={(props) => <RepeatIcon {...props} weight={status.reblogged ? 'fill' : undefined} />}
        onPress={() => (status.reblogged ? unreblogStatus : reblogStatus)({})}
        disabled={isPendingReblog}
        style={{ margin: -4, marginTop: 0, height: 40, width: 40 }}
        selected={status.reblogged}
        accessibilityLabel={intl.formatMessage(
          status.reblogged ? messages.unreblog : messages.reblog,
        )}
      />
      <IconButton
        icon={(props) => <StarIcon {...props} weight={status.favourited ? 'fill' : undefined} />}
        onPress={() => (status.favourited ? unfavouriteStatus : favouriteStatus)()}
        disabled={isPendingFavourite}
        style={{ margin: -4, marginTop: 0, height: 40, width: 40 }}
        selected={status.favourited}
        accessibilityLabel={intl.formatMessage(
          status.favourited ? messages.unfavourite : messages.favourite,
        )}
      />
    </View>
  );
};

interface IStatus {
  id: string;
  isConnectedBottom?: boolean;
}

const Status: React.FC<IStatus> = ({ id, isConnectedBottom }) => {
  const { data: status } = useStatus(id);

  if (!status) return null;

  return (
    <UIStatus
      account={
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between', flex: 1 }}>
          <Account id={status.account_id!} />
          <IconButton
            icon={iconHelper(DotsThreeVerticalIcon)}
            onPress={() => {}}
            style={{ height: 32, width: 32 }}
          />
        </View>
      }
      content={status.content}
      actions={<StatusActions id={id} />}
      isConnectedBottom={isConnectedBottom}
    />
  );
};

export { Status };
