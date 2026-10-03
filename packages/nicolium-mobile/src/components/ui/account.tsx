import {
  Avatar,
  Text,
  TouchableRipple,
  useTheme,
  type TouchableRippleProps,
} from '@mkljczk/react-native-paper';
import React from 'react';
import { View } from 'react-native';

import RelativeTimestamp from '@/utils/relative-timestamp';

interface IUIAccount extends Pick<TouchableRippleProps, 'onPress' | 'style'> {
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
  style,
  onPress,
}) => {
  const { colors } = useTheme();

  const MaybeLink = ({ children }: { children: React.JSX.Element }) =>
    onPress ? <TouchableRipple onPress={onPress}>{children}</TouchableRipple> : children;

  return (
    <View style={{ ...style, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <MaybeLink>
        {avatarSrc ? (
          <Avatar.Image size={40} source={{ uri: avatarSrc }} />
        ) : (
          <Avatar.Text size={40} label={(displayName || acct).slice(0, 2)} />
        )}
      </MaybeLink>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
        <MaybeLink>
          <View style={{ gap: 4, alignItems: 'center', flexDirection: 'row' }}>
            <Text variant='titleMedium' numberOfLines={1}>
              {displayName}
            </Text>
            {displayNameDetail && (
              <Text
                variant='bodySmall'
                numberOfLines={1}
                style={{ flex: 1, color: colors.outline }}
              >
                {'· '}
                {displayNameDetail}
              </Text>
            )}
          </View>
        </MaybeLink>
        <MaybeLink>
          <Text variant='bodyMedium' numberOfLines={1} style={{ color: colors.outline }}>
            @{acct}
            {timestamp && (
              <>
                {' · '}
                <RelativeTimestamp timestamp={timestamp} />
              </>
            )}
          </Text>
        </MaybeLink>
      </View>
    </View>
  );
};

export { UIAccount, IUIAccount };
