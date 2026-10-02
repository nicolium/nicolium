import React from 'react';
import { View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';

import RelativeTimestamp from '@/utils/relative-timestamp';

interface IUIAccount {
  avatarSrc?: string;
  displayName: string;
  displayNameDetail?: string;
  acct: string;
  timestamp?: string;
}

const UIAccount: React.FC<IUIAccount> = ({
  avatarSrc,
  displayName,
  displayNameDetail,
  acct,
  timestamp,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {avatarSrc ? (
        <Avatar.Image size={40} source={{ uri: avatarSrc }} />
      ) : (
        <Avatar.Text size={40} label={(displayName || acct).slice(0, 2)} />
      )}

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ gap: 4, alignItems: 'center', flexDirection: 'row' }}>
          <Text variant='titleMedium' numberOfLines={1}>
            {displayName}
          </Text>
          {displayNameDetail && (
            <Text variant='bodySmall' numberOfLines={1} style={{ flex: 1, color: colors.outline }}>
              {' · '}
              {displayNameDetail}
            </Text>
          )}
        </View>
        <Text variant='bodyMedium' numberOfLines={1} style={{ color: colors.outline }}>
          @{acct}
          {timestamp && (
            <>
              {' · '}
              <RelativeTimestamp timestamp={timestamp} />
            </>
          )}
        </Text>
      </View>
    </View>
  );
};

export { UIAccount };
