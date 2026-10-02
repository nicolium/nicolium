import { InfoIcon, SignOutIcon } from 'phosphor-react-native';
import { ScrollView } from 'react-native';
import { Divider, List, useTheme } from 'react-native-paper';

import { iconHelper } from '@/components/ui/icon';
import { useAuthStoreActions } from '@/stores/auth';

import type { RootStackParams } from '../router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const SettingsScreen = ({ navigation }: NativeStackScreenProps<RootStackParams, 'settings'>) => {
  const theme = useTheme();

  const { signOut } = useAuthStoreActions();

  return (
    <ScrollView>
      <List.Item
        title='About Nicolium'
        left={(props) => <List.Icon {...props} icon={InfoIcon} />}
        onPress={() => navigation.navigate('about')}
      />
      <Divider />
      <List.Item
        title='Log out'
        left={(props) => (
          <List.Icon {...props} color={theme.colors.error} icon={iconHelper(SignOutIcon)} />
        )}
        onPress={() => signOut()}
        titleStyle={{ color: theme.colors.error }}
      />
    </ScrollView>
  );
};

export { SettingsScreen };
