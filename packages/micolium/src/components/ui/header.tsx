import { Appbar, useTheme } from '@mkljczk/react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';
import React from 'react';

import { HeaderBackButton } from './header-icon-button';

import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

const Header = ({ navigation, route, options, back }: NativeStackHeaderProps) => {
  const { colors } = useTheme();
  const title = getHeaderTitle(options, route.name);

  return (
    <Appbar.Header
      mode='small'
      style={{
        backgroundColor: colors.surfaceContainer,
      }}
    >
      {back ? <HeaderBackButton onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
};

export { Header };
