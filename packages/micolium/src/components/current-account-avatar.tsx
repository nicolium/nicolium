import { Avatar } from '@mkljczk/react-native-paper';
import { Image } from 'expo-image';
import { UserIcon } from 'phosphor-react-native/src/icons/User';
import React from 'react';

import { useCredentialAccount } from '@/queries/accounts/use-account-credentials';

import { iconHelper } from './ui/icon';

interface ICurrentAccountAvatar {
  size?: number;
}

const CurrentAccountAvatar: React.FC<ICurrentAccountAvatar> = ({ size = 24 }) => {
  const { data: currentAccount } = useCredentialAccount();

  return currentAccount ? (
    currentAccount.avatar_default ? (
      <Avatar.Text
        size={size}
        label={(currentAccount.display_name || currentAccount.acct).slice(0, 2)}
      />
    ) : (
      <Image
        source={{ uri: currentAccount.avatar }}
        accessibilityLabel={currentAccount.avatar_description}
        style={{
          height: size,
          width: size,
          borderRadius: size / 2,
        }}
        contentFit='contain'
        recyclingKey={`avatar-${currentAccount.id}`}
      />
    )
  ) : (
    <Avatar.Icon size={size} icon={iconHelper(UserIcon)} />
  );
};

export { CurrentAccountAvatar };
