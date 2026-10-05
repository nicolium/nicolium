import { Divider, List, useTheme } from '@mkljczk/react-native-paper';
import { InfoIcon, SignOutIcon, UserPlusIcon } from 'phosphor-react-native';
import { FormattedMessage } from 'react-intl';
import { ScrollView } from 'react-native';

import { iconHelper } from '@/components/ui/icon';
import { useAuthStoreActions } from '@/stores/auth';
import { useUiStoreActions } from '@/stores/ui';

import type { RootStackParams } from '../router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const SettingsScreen = ({ navigation }: NativeStackScreenProps<RootStackParams, 'settings'>) => {
  const theme = useTheme();

  const { signOut } = useAuthStoreActions();
  const { openAccountSwitcher } = useUiStoreActions();

  return (
    <ScrollView>
      <List.Item
        title='About Nicolium'
        left={(props) => <List.Icon {...props} icon={InfoIcon} />}
        onPress={() => navigation.navigate('about')}
      />
      <Divider />
      <List.Item
        title={
          <FormattedMessage
            id='settings.add_or_switch_accounts'
            defaultMessage='Add or switch accounts'
          />
        }
        left={(props) => <List.Icon {...props} icon={iconHelper(UserPlusIcon)} />}
        onPress={() => openAccountSwitcher()}
      />
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
