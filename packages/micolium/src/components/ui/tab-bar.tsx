import { useTheme } from '@mkljczk/react-native-paper';
import { Keyboard } from 'react-native';

import type { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';

const useTabBarProps = () => {
  const { colors } = useTheme();

  const screenOptions: MaterialTopTabNavigationOptions = {
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.onSurfaceVariant,
    tabBarIndicatorStyle: { backgroundColor: colors.primary },
    tabBarStyle: {
      backgroundColor: colors.surfaceContainer,
      borderBottomColor: colors.outlineVariant,
    },
    lazy: true,
  };

  return {
    screenOptions,
    screenListeners: { tabPress: () => Keyboard.dismiss() },
  };
};

export { useTabBarProps };
