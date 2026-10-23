import { Button, useTheme, type ButtonProps } from '@mkljczk/react-native-paper';
import { GlassView } from 'expo-glass-effect';
import React from 'react';

import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';

import type { StyleProp, ViewStyle } from 'react-native';

const GlassButton: React.FC<
  ButtonProps & { containerStyle?: StyleProp<ViewStyle>; destructive?: boolean }
> = (props) => {
  const glassEffect = useEnableLiquidGlass();
  const { colors } = useTheme();

  const button = (
    <Button
      {...props}
      mode={glassEffect ? 'outlined' : props.mode}
      textColor={props.destructive ? colors.onErrorContainer : undefined}
    />
  );

  if (glassEffect) {
    return (
      <GlassView
        style={[{ flexDirection: 'row', borderRadius: 9999 }, props.containerStyle]}
        isInteractive={!props.disabled}
        tintColor={props.destructive ? colors.errorContainer : undefined}
      >
        {button}
      </GlassView>
    );
  }

  return button;
};

export { GlassButton };
