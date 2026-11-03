import { useTheme } from '@mkljczk/react-native-paper';
import React from 'react';
import { Keyboard } from 'react-native';
import { TabBar as TabViewTabBar } from 'react-native-tab-view';

const TabBar: typeof TabViewTabBar = (props) => {
  const { colors } = useTheme();

  return (
    <TabViewTabBar
      {...props}
      activeColor={colors.primary}
      inactiveColor={colors.onSurfaceVariant}
      pressColor={colors.surfaceContainerHighest}
      indicatorStyle={{ backgroundColor: colors.primary }}
      style={{
        backgroundColor: colors.surfaceContainer,
        borderBottomColor: colors.outlineVariant,
      }}
      onTabPress={() => {
        Keyboard.dismiss();
      }}
    />
  );
};

export { TabBar };
