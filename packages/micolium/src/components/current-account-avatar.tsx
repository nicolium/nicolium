import { Avatar } from '@mkljczk/react-native-paper';
import { UserIcon } from 'phosphor-react-native/src/icons/User';
import React from 'react';

import { StillImage } from '@/components/still-image';
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
      <StillImage
        src={currentAccount.avatar}
        staticSrc={currentAccount.avatar_static}
        accessibilityLabel={currentAccount.avatar_description}
        style={{
          height: size,
          width: size,
          borderRadius: size / 2,
        }}
        contentFit='contain'
        recyclingKey={`avatar-${currentAccount.id}`}
        aria-hidden={!currentAccount.avatar_description}
      />
    )
  ) : (
    <Avatar.Icon size={size} icon={iconHelper(UserIcon)} />
  );
};

export { CurrentAccountAvatar };
