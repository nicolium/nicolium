import { DotsThreeVerticalIcon } from 'phosphor-react-native';
import React from 'react';
import { View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { useStatus } from '@/queries/statuses/use-status';

import { Account } from '../accounts/account';
import { iconHelper } from '../ui/icon';
import { UIStatus } from '../ui/status';

import { StatusActions } from './status-actions';

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
