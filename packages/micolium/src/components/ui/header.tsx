import { Appbar, useTheme } from '@mkljczk/react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';
import React from 'react';
import { useColorScheme } from 'react-native';

import { useSetting } from '@/stores/settings';

import { HeaderBackButton } from './header-icon-button';

import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

const Header = ({ navigation, route, options, back }: NativeStackHeaderProps) => {
  const { colors } = useTheme();
  const title = getHeaderTitle(options, route.name);
  const colorScheme = useColorScheme();
  const blackTheme = useSetting('appearance.black');

  return (
    <Appbar.Header
      mode='small'
      style={[
        {
          backgroundColor: colors.surfaceContainer,
        },
        colorScheme === 'dark' &&
          blackTheme && {
            borderBottomWidth: 1,
            borderBottomColor: colors.surfaceContainerHighest,
          },
      ]}
    >
      {back ? <HeaderBackButton onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
};

export { Header };
