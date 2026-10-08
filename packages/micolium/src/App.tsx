import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PaperProvider, type Theme } from '@mkljczk/react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { createURL } from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';

import { AccountSwitcherBottomSheet } from './components/account-switcher';
import { ComposeBottomSheet } from './components/compose';
import { DefaultCurrentAccountProvider } from './contexts/current-account-context';
import enMessages from './messages/en.json';
import { RootNavigator } from './navigation/router';
import { loadPolyfills } from './polyfills';
import { queryClient } from './queries/client';
import { DarkTheme, LightTheme } from './utils/themes';

SplashScreen.preventAutoHideAsync();

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
  const [loaded, setLoaded] = React.useState(false);

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  React.useEffect(() => {
    loadPolyfills().finally(() => {
      setLoaded(true);
      SplashScreen.hideAsync();
    });
  });

  if (!loaded) return null;

  return (
    <IntlProvider locale='en' messages={enMessages}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <KeyboardProvider>
            <DefaultCurrentAccountProvider>
              <QueryClientProvider client={queryClient}>
                <NavigationContainer theme={theme} linking={linking}>
                  <GestureHandlerRootView>
                    <BottomSheetModalProvider>
                      <RootNavigator />
                      <Toaster position='bottom-center' />
                      <AccountSwitcherBottomSheet />
                      <ComposeBottomSheet />
                    </BottomSheetModalProvider>
                  </GestureHandlerRootView>
                </NavigationContainer>
              </QueryClientProvider>
            </DefaultCurrentAccountProvider>
          </KeyboardProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </IntlProvider>
  );
};
