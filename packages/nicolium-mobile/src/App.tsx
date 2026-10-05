import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PaperProvider, type Theme } from '@mkljczk/react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { createURL } from 'expo-linking';
import { IntlProvider } from 'react-intl';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AccountSwitcher, AccountSwitcherBottomSheet } from './components/account-switcher';
import { DefaultCurrentAccountProvider } from './contexts/current-account-context';
import enMessages from './messages/en.json';
import { RootNavigator } from './navigation/router';
import { queryClient } from './queries/client';
import { DarkTheme, LightTheme } from './utils/themes';

const linking = {
  enabled: true,
  prefixes: [createURL('/')],
};

const darkTheme: Theme = {
  ...DarkTheme,
  shapes: {
    ...DarkTheme.shapes,
    corner: {
      ...DarkTheme.shapes.corner,
      extraLarge: DarkTheme.shapes.corner.medium,
    },
  },
};

const lightTheme: Theme = {
  ...LightTheme,
  shapes: {
    ...LightTheme.shapes,
    corner: {
      ...LightTheme.shapes.corner,
      extraLarge: LightTheme.shapes.corner.medium,
    },
  },
};

export const App = () => {
  const colorScheme = useColorScheme();

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <IntlProvider locale='en' messages={enMessages}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <DefaultCurrentAccountProvider>
            <QueryClientProvider client={queryClient}>
              <NavigationContainer theme={theme} linking={linking}>
                <GestureHandlerRootView>
                  <BottomSheetModalProvider>
                    <RootNavigator />
                    <AccountSwitcherBottomSheet />
                  </BottomSheetModalProvider>
                </GestureHandlerRootView>
              </NavigationContainer>
            </QueryClientProvider>
          </DefaultCurrentAccountProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </IntlProvider>
  );
};
