import React from 'react';
import { View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';

import { useAccount } from '@/queries/accounts/use-account';

interface IAccount {
  avatarSrc?: string;
  displayName: string;
  acct: string;
}

interface IAccountFromServer {
  id: string;
}

const Account: React.FC<IAccount> & { FromServer: React.FC<IAccountFromServer> } = ({
  avatarSrc,
  displayName,
  acct,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {avatarSrc ? (
        <Avatar.Image size={40} source={{ uri: avatarSrc }} />
      ) : (
        <Avatar.Text size={40} label={(displayName || acct).slice(0, 2)} />
      )}

      <View style={{ justifyContent: 'center' }}>
        <Text variant='titleMedium' numberOfLines={1}>{displayName}</Text>
        <Text variant='bodyMedium' numberOfLines={1} style={{ color: colors.outline }}>
          @{acct}
        </Text>
      </View>
    </View>
  );
};

Account.FromServer = ({ id }) => {
  const { data: account } = useAccount(id);

  if (!account) return null;

  return (
    <Account avatarSrc={account.avatar} displayName={account.display_name} acct={account.acct} />
  );
};

export { Account };
