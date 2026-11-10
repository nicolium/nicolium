import { GlassView } from 'expo-glass-effect';
import React from 'react';
import { Platform } from 'react-native';
import { toast, Toaster } from 'sonner-native';

import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';

const ToastRoot = () => {
  const glassEffect = useEnableLiquidGlass();

  return (
    <Toaster
      position={'bottom-center'}
      enableStacking={Platform.OS === 'ios'}
      toastOptions={{
        backgroundComponent: glassEffect ? (
          <GlassView
            glassEffectStyle='regular'
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 8,
              borderCurve: 'continuous',
            }}
          />
        ) : undefined,
      }}
    />
  );
};

export { toast, ToastRoot };
