import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { createURL } from 'expo-linking';
import { IntlProvider } from 'react-intl';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import enMessages from './messages/en.json';
import { RootNavigator } from './navigation/router';
import { queryClient } from './queries/client';
import { DarkTheme, LightTheme } from './utils/themes';

const linking = {
  enabled: true,
  prefixes: [createURL('/')],
};

export const App = () => {
  const colorScheme = useColorScheme();

  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <IntlProvider locale='en' messages={enMessages}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer theme={theme} linking={linking}>
              <RootNavigator />
            </NavigationContainer>
          </QueryClientProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </IntlProvider>
  );
};
