import {
  Avatar,
  Text,
  TouchableRipple,
  useTheme,
  type TouchableRippleProps,
} from '@mkljczk/react-native-paper';
import { Image } from 'expo-image';
import React from 'react';
import { type GestureResponderEvent, View, type StyleProp, type ViewStyle } from 'react-native';

import RelativeTimestamp from '@/components/relative-timestamp';

import { Emojify } from './emojify';

import type { CustomEmoji } from 'pl-api';

const MaybeLink = ({
  children,
  onPress,
  fullWidthPressable,
}: {
  children: React.JSX.Element;
  onPress?: (event: GestureResponderEvent) => void;
  fullWidthPressable?: boolean;
}) =>
  onPress && !fullWidthPressable ? (
    <TouchableRipple onPress={onPress} style={{ maxWidth: '100%' }}>
      {children}
    </TouchableRipple>
  ) : (
    children
  );

interface IUIAccount extends Pick<TouchableRippleProps, 'onPress' | 'style'> {
  id?: string;
  avatarSrc?: string;
  avatarDescription?: string;
  displayName: string;
  displayNameDetail?: string;
  emojis?: Array<CustomEmoji>;
  acct: string;
  timestamp?: string;
  futureDate?: boolean;
  fullWidthPressable?: boolean;
  action?: React.JSX.Element;
  badge?: React.JSX.Element;
}

const UIAccount: React.FC<IUIAccount> = ({
  id,
  avatarSrc,
  avatarDescription,
  displayName,
  displayNameDetail,
  emojis,
  acct,
  timestamp,
  futureDate,
  fullWidthPressable = true,
  style,
  onPress,
  action,
  badge,
}) => {
  const { colors } = useTheme();

  const body = (
    <>
      <View style={{ position: 'relative' }}>
        <MaybeLink onPress={onPress} fullWidthPressable={fullWidthPressable}>
          {avatarSrc ? (
            <Image
              source={{ uri: avatarSrc }}
              accessibilityLabel={avatarDescription}
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
              }}
              contentFit='contain'
              recyclingKey={`avatar-${id}`}
            />
          ) : (
            <Avatar.Text size={40} label={(displayName || acct).slice(0, 2)} />
          )}
        </MaybeLink>
        {badge && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              transform: 'translate(25%, 25%)',
            }}
          >
            {badge}
          </View>
        )}
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
        <MaybeLink onPress={onPress} fullWidthPressable={fullWidthPressable}>
          <View style={{ gap: 4, alignItems: 'center', flexDirection: 'row', maxWidth: '100%' }}>
            <Text variant='titleMedium' numberOfLines={1}>
              {emojis ? <Emojify text={displayName} emojis={emojis} /> : displayName}
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
        <MaybeLink onPress={onPress} fullWidthPressable={fullWidthPressable}>
          <Text variant='bodyMedium' numberOfLines={1} style={{ color: colors.outline }}>
            @{acct}
            {timestamp && (
              <>
                {' · '}
                <RelativeTimestamp timestamp={timestamp} futureDate={futureDate} />
              </>
            )}
          </Text>
        </MaybeLink>
      </View>

      {action}
    </>
  );

  const styles: StyleProp<ViewStyle> = {
    ...style,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  };

  if (onPress && fullWidthPressable) {
    return (
      <TouchableRipple onPress={onPress} style={styles}>
        {body}
      </TouchableRipple>
    );
  }
  return <View style={styles}>{body}</View>;
};

export { UIAccount, IUIAccount };
