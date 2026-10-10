import { Avatar } from '@mkljczk/react-native-paper';
import { UserIcon } from 'phosphor-react-native';
import React from 'react';

import { useCredentialAccount } from '@/queries/accounts/use-account-credentials';

import { iconHelper } from './ui/icon';

interface ICurrentAccountAvatar {
  size?: number;
}

const CurrentAccountAvatar: React.FC<ICurrentAccountAvatar> = ({ size = 24 }) => {
  const { data: currentAccount } = useCredentialAccount();

  return currentAccount ? (
    <Avatar.Image size={size} source={{ uri: currentAccount.avatar }} />
  ) : (
    <Avatar.Icon size={size} icon={iconHelper(UserIcon)} />
  );
};

export { CurrentAccountAvatar };
