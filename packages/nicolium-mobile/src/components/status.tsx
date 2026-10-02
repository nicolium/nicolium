import RenderHtml from '@native-html/render';
import {
  ArrowBendDoubleUpLeftIcon,
  ArrowBendUpLeftIcon,
  DotsThreeVerticalIcon,
  RepeatIcon,
  StarIcon,
} from 'phosphor-react-native';
import React from 'react';
import { View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

import { useStatus } from '@/queries/statuses/use-status';

import { Account } from './account';

interface IStatus {
  account: React.JSX.Element;
  content: string;
  actions?: React.JSX.Element;
  isConnectedBottom?: boolean;
}

interface IStatusFromServer {
  id: string;
  isConnectedBottom?: boolean;
}

const Status: React.FC<IStatus> & { FromServer: React.FC<IStatusFromServer> } = ({
  account,
  content,
  actions,
  isConnectedBottom,
}) => {
  const theme = useTheme();

  const status = (
    <View style={{ flexDirection: 'column', gap: 8, flex: 1 }}>
      <RenderHtml
        source={{ html: content }}
        tagsStyles={{
          p: {
            marginVertical: 0,
          },
        }}
      />
      {actions}
    </View>
  );

  return (
    <View style={{ flexDirection: 'column', gap: 8, marginBottom: isConnectedBottom ? -16 : 0 }}>
      {account}
      {isConnectedBottom ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View
            style={{
              marginHorizontal: 19,
              width: 2,
              backgroundColor: theme.colors.surfaceDim,
              marginBottom: -8
            }}
          ></View>
          {status}
        </View>
      ) : (
        status
      )}
    </View>
  );
};

Status.FromServer = ({ id, isConnectedBottom }) => {
  const { data: status } = useStatus(id);

  if (!status) return null;

  return (
    <Status
      account={
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between', flex: 1 }}>
          <Account.FromServer id={status.account_id!} />
          <IconButton
            icon={DotsThreeVerticalIcon}
            onPress={() => {}}
            style={{ height: 32, width: 32 }}
          />
        </View>
      }
      content={status.content}
      actions={
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <IconButton
            icon={status.in_reply_to_id ? ArrowBendDoubleUpLeftIcon : ArrowBendUpLeftIcon}
            onPress={() => {}}
            style={{ margin: -4, marginTop: 0, height: 40, width: 40 }}
          />
          <IconButton
            icon={(props) => (
              <RepeatIcon {...props} weight={status.reblogged ? 'fill' : undefined} />
            )}
            onPress={() => {}}
            style={{ margin: -4, marginTop: 0, height: 40, width: 40 }}
            selected={status.reblogged}
          />
          <IconButton
            icon={(props) => (
              <StarIcon {...props} weight={status.favourited ? 'fill' : undefined} />
            )}
            onPress={() => {}}
            style={{ margin: -4, marginTop: 0, height: 40, width: 40 }}
            selected={status.favourited}
          />
        </View>
      }
      isConnectedBottom={isConnectedBottom}
    />
  );
};

export { Status };
