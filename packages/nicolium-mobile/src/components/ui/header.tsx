import { getHeaderTitle } from '@react-navigation/elements';
import { Appbar } from 'react-native-paper';

import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

const Header = ({ navigation, route, options, back }: NativeStackHeaderProps) => {
  const title = getHeaderTitle(options, route.name);

  return (
    <Appbar.Header>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
};

export { Header };
