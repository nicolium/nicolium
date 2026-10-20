import { Button, type ButtonProps } from '@mkljczk/react-native-paper';
import { GlassView } from 'expo-glass-effect';
import React from 'react';

import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';

import type { StyleProp, ViewStyle } from 'react-native';

const GlassButton: React.FC<ButtonProps & { containerStyle?: StyleProp<ViewStyle> }> = (props) => {
  const glassEffect = useEnableLiquidGlass();

  const button = <Button {...props} mode={glassEffect ? 'outlined' : props.mode} />;

  if (glassEffect) {
    return (
      <GlassView
        style={[{ flexDirection: 'row', borderRadius: 9999 }, props.containerStyle]}
        isInteractive={!props.disabled}
      >
        {button}
      </GlassView>
    );
  }

  return button;
};

export { GlassButton };
