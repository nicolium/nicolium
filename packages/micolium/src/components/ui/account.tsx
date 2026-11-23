import {
  Avatar,
  Text,
  TouchableRipple,
  useTheme,
  type TouchableRippleProps,
} from '@mkljczk/react-native-paper';
import React from 'react';
import { type GestureResponderEvent, View, type StyleProp, type ViewStyle } from 'react-native';

import RelativeTimestamp from '@/components/relative-timestamp';
import { StillImage } from '@/components/still-image';

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
  avatarStaticSrc?: string;
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
  avatarStaticSrc,
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
            <StillImage
              src={avatarSrc}
              staticSrc={avatarStaticSrc}
              accessibilityLabel={avatarDescription}
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
              }}
              contentFit='contain'
              recyclingKey={`avatar-${id}`}
              aria-hidden={!avatarDescription}
            />
          ) : (
            <Avatar.Text size={40} label={(displayName || acct).slice(0, 2)} aria-hidden />
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
              {displayNameDetail && (
                <Text variant='bodySmall' style={{ flex: 1, color: colors.outline }}>
                  {' · '}
                  {displayNameDetail}
                </Text>
              )}
            </Text>
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
