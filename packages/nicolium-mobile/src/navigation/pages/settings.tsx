import { InfoIcon } from 'phosphor-react-native';
import { ScrollView } from 'react-native';
import { List } from 'react-native-paper';

import type { RootStackParams } from '../router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const SettingsScreen = ({ navigation }: NativeStackScreenProps<RootStackParams, 'settings'>) => {
  return (
    <ScrollView>
      <List.Item
        title='About Nicolium'
        left={(props) => <List.Icon {...props} icon={(props) => <InfoIcon {...props} />} />}
        onPress={() => navigation.navigate('about')}
      />
    </ScrollView>
  );
};

export { SettingsScreen };
