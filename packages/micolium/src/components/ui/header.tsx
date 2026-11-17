import { Appbar, useTheme } from '@mkljczk/react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';
import React from 'react';
import { useColorScheme } from 'react-native';

import { useSetting } from '@/stores/settings';

import { CornerInset } from './corner-inset';
import { HeaderBackButton } from './header-icon-button';

import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

interface IHeader extends NativeStackHeaderProps {
  withBottomBorder?: boolean;
}

const Header = ({ navigation, route, options, back, withBottomBorder = true }: IHeader) => {
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
        withBottomBorder &&
          colorScheme === 'dark' &&
          blackTheme && {
            borderBottomWidth: 1,
            borderBottomColor: colors.surfaceContainerHighest,
          },
      ]}
    >
      <CornerInset direction='horizontal' edge='left' />
      {back ? <HeaderBackButton onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
      {options.headerRight?.({ canGoBack: !!back })}
    </Appbar.Header>
  );
};

export { Header };
