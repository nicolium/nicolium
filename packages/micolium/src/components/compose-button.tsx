import { FAB, Icon } from '@mkljczk/react-native-paper';
import { GlassView } from 'expo-glass-effect';
import { EnvelopeSimpleIcon } from 'phosphor-react-native/src/icons/EnvelopeSimple';
import { NotePencilIcon } from 'phosphor-react-native/src/icons/NotePencil';
import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useComposeActions } from '@/stores/compose';
import { useUiStoreActions } from '@/stores/ui';

import { iconHelper } from './ui/icon';

const messages = defineMessages({
  compose: { id: 'navigation.compose', defaultMessage: 'Compose' },
  newMessage: { id: 'conversations.new', defaultMessage: 'New message' },
});

interface IComposeButton {
  visible: boolean;
  direct?: boolean;
}

const ComposeButton: React.FC<IComposeButton> = ({ direct, visible }) => {
  const intl = useIntl();
  const glassEffect = useEnableLiquidGlass();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const { openCompose } = useUiStoreActions();
  const { updateCompose, resetCompose } = useComposeActions();

  const iconOpacity = useSharedValue(+visible);
  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));

  useEffect(() => {
    iconOpacity.value = withTiming(+visible, { duration: 250 });
  }, [visible, iconOpacity]);

  const handleCompose = () => {
    if (direct) {
      resetCompose('compose-modal');
      updateCompose('compose-modal', (draft) => {
        draft.visibility = 'direct';
      });
    }

    openCompose();
  };

  if (glassEffect) {
    return (
      <Pressable
        onPress={handleCompose}
        accessibilityLabel={intl.formatMessage(direct ? messages.newMessage : messages.compose)}
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
            <Icon source={iconHelper(direct ? EnvelopeSimpleIcon : NotePencilIcon)} size={24} />
          </Animated.View>
        </GlassView>
      </Pressable>
    );
  }

  return (
    <FAB
      onPress={openCompose}
      icon={iconHelper(direct ? EnvelopeSimpleIcon : NotePencilIcon)}
      style={{
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: bottomInset,
      }}
      visible={visible}
      aria-label={intl.formatMessage(direct ? messages.newMessage : messages.compose)}
    />
  );
};

export { ComposeButton };
