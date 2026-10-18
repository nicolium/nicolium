import { FAB, Icon } from '@mkljczk/react-native-paper';
import { GlassView } from 'expo-glass-effect';
import { NotePencilIcon } from 'phosphor-react-native/src/icons/NotePencil';
import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useUiStoreActions } from '@/stores/ui';

import { iconHelper } from './ui/icon';

const messages = defineMessages({
  compose: { id: 'navigation.compose', defaultMessage: 'Compose' },
});

interface IComposeButton {
  visible: boolean;
}

const ComposeButton: React.FC<IComposeButton> = ({ visible }) => {
  const intl = useIntl();
  const glassEffect = useEnableLiquidGlass();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const { openCompose } = useUiStoreActions();

  const iconOpacity = useSharedValue(+visible);
  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));

  useEffect(() => {
    iconOpacity.value = withTiming(+visible, { duration: 250 });
  }, [visible, iconOpacity]);

  if (glassEffect) {
    return (
      <Pressable
        onPress={openCompose}
        accessibilityLabel={intl.formatMessage(messages.compose)}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: bottomInset,
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <GlassView
          glassEffectStyle={{
            style: visible ? 'regular' : 'none',
            animate: true,
          }}
          isInteractive
          style={{
            height: 56,
            width: 56,
            padding: 16,
            borderRadius: 28,
          }}
        >
          <Animated.View style={iconStyle}>
            <Icon source={iconHelper(NotePencilIcon)} size={24} />
          </Animated.View>
        </GlassView>
      </Pressable>
    );
  }

  return (
    <FAB
      onPress={openCompose}
      icon={iconHelper(NotePencilIcon)}
      style={{
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: bottomInset,
      }}
      visible={visible}
      aria-label={intl.formatMessage(messages.compose)}
    />
  );
};

export { ComposeButton };
