import { getHeaderTitle } from '@react-navigation/elements';
import { Appbar, useTheme } from 'react-native-paper';

import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

const Header = ({ navigation, route, options, back }: NativeStackHeaderProps) => {
  const { colors } = useTheme();
  const title = getHeaderTitle(options, route.name);

  return (
    <Appbar.Header
      style={{
        backgroundColor: colors.surfaceContainer,
      }}
    >
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
};

export { Header };
