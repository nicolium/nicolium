import { Appbar, Badge, Icon } from '@mkljczk/react-native-paper';
import { GlassView } from 'expo-glass-effect';
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Platform, Pressable, View, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';

import { iconHelper } from './icon';

import type { Icon as PhosphorIcon } from 'phosphor-react-native';

const messages = defineMessages({
  back: { id: 'card.back.label', defaultMessage: 'Back' },
});

interface IHeaderIconButton extends PressableProps {
  icon: PhosphorIcon;
  badge?: number;
  visible?: boolean;
}

const HeaderIconButton: React.FC<IHeaderIconButton> = ({
  icon,
  badge,
  visible = true,
  ...props
}) => {
  const glassEffect = useEnableLiquidGlass();

  const iconOpacity = useSharedValue(+visible);
  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));

  React.useEffect(() => {
    iconOpacity.set(withTiming(+visible, { duration: 250 }));
  }, [visible, iconOpacity]);

  if (glassEffect) {
    return (
      <Pressable {...props} style={{ marginHorizontal: 8 }}>
        <GlassView
          glassEffectStyle={{
            style: visible ? 'regular' : 'none',
            animate: true,
          }}
          style={{
            position: 'relative',
            borderRadius: 20,
            padding: 8,
            opacity: props.disabled ? 0.5 : 1,
          }}
          isInteractive={!props.disabled}
        >
          <Animated.View style={iconStyle}>
            <Icon size={24} source={iconHelper(icon)} />
            <Badge
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                minWidth: badge && (badge >= 1000 ? 40 : badge >= 100 ? 32 : undefined),
              }}
              visible={!!badge}
            >
              {badge && badge >= 1000 ? '999+' : badge}
            </Badge>
          </Animated.View>
        </GlassView>
      </Pressable>
    );
  }

  return (
    <View style={{ position: 'relative' }}>
      <Appbar.Action icon={iconHelper(icon)} size={32} {...props} />
      <Badge style={{ position: 'absolute', top: 4, right: 4 }} visible={!!badge}>
        {badge}
      </Badge>
    </View>
  );
};

const HeaderBackButton: React.FC<PressableProps> = (props) => {
  const intl = useIntl();

  return (
    <HeaderIconButton
      icon={Platform.OS === 'ios' ? CaretLeftIcon : ArrowLeftIcon}
      accessibilityLabel={intl.formatMessage(messages.back)}
      {...props}
    />
  );
};

export { HeaderIconButton, HeaderBackButton };
