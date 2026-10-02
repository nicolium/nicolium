import React from 'react';
import { View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';

interface IUIAccount {
  avatarSrc?: string;
  displayName: string;
  acct: string;
}

const UIAccount: React.FC<IUIAccount> = ({ avatarSrc, displayName, acct }) => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {avatarSrc ? (
        <Avatar.Image size={40} source={{ uri: avatarSrc }} />
      ) : (
        <Avatar.Text size={40} label={(displayName || acct).slice(0, 2)} />
      )}

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text variant='titleMedium' numberOfLines={1}>
          {displayName}
        </Text>
        <Text variant='bodyMedium' numberOfLines={1} style={{ color: colors.outline }}>
          @{acct}
        </Text>
      </View>
    </View>
  );
};

export { UIAccount };
