import { useTheme } from '@mkljczk/react-native-paper';
import React from 'react';
import { Keyboard } from 'react-native';
import { TabBar as TabViewTabBar, type Route, type TabBarProps } from 'react-native-tab-view';

interface ITabBar<T extends Route> extends TabBarProps<T> {
  onTabReselect?: (route: T) => void;
}

const TabBar = <T extends Route>({ onTabReselect, ...props }: ITabBar<T>) => {
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
      onTabPress={(scene) => {
        Keyboard.dismiss();
        if (scene.route.key === props.navigationState.routes[props.navigationState.index].key) {
          onTabReselect?.(scene.route);
        }
        props.onTabPress?.(scene);
      }}
    />
  );
};

export { TabBar };
