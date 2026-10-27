import { TrueSheetProvider } from '@lodev09/react-native-true-sheet';
import { PaperProvider } from '@mkljczk/react-native-paper';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeRedirectUri } from 'expo-auth-session';
import { createURL } from 'expo-linking';
import { useCalendars } from 'expo-localization';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';

import { AccountSwitcherBottomSheet } from './components/account-switcher';
import { ComposeBottomSheet } from './components/compose/compose';
import { EmojiPickerBottomSheet } from './components/emoji-picker';
import { InteractAsSheet } from './components/interact-as';
import { MediaViewer } from './components/media-viewer';
import { DefaultCurrentAccountProvider } from './contexts/current-account-context';
import enMessages from './messages/en.json';
import { loadPolyfills } from './polyfills';
import { queryClient } from './queries/client';
import { RootNavigator } from './router/router';
import { DarkTheme, LightTheme } from './utils/themes';

SplashScreen.preventAutoHideAsync();

const linking = {
  enabled: true,
  prefixes: [createURL('/')],
  filter: (url: string) =>
    !url.startsWith(makeRedirectUri({ scheme: 'micolium', path: 'redirect' })),
};

const darkTheme = {
  ...DarkTheme,
  shapes: {
    ...DarkTheme.shapes,
    corner: {
      ...DarkTheme.shapes.corner,
      extraLarge: DarkTheme.shapes.corner.medium,
    },
  },
};

const lightTheme = {
  ...LightTheme,
  shapes: {
    ...LightTheme.shapes,
    corner: {
      ...LightTheme.shapes.corner,
      extraLarge: LightTheme.shapes.corner.medium,
    },
  },
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();

  const paperTheme =
    colorScheme === 'dark'
      ? { ...darkTheme, colors: theme.dark }
      : { ...lightTheme, colors: theme.light };

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={paperTheme} linking={linking} {...props} />
    </PaperProvider>
  );
};

export const App = () => {
  const [{ timeZone }] = useCalendars();

  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    loadPolyfills().finally(() => {
      setLoaded(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!loaded) return null;

  return (
    <IntlProvider locale='en' timeZone={timeZone || undefined} messages={enMessages}>
      <SafeAreaProvider>
        <ThemeProvider>
          <KeyboardProvider>
            <DefaultCurrentAccountProvider>
              <QueryClientProvider client={queryClient}>
                <GestureHandlerRootView>
                  <TrueSheetProvider>
                    <RootNavigator />
                    <Toaster position='bottom-center' />
                    <AccountSwitcherBottomSheet />
                    <ComposeBottomSheet />
                    <EmojiPickerBottomSheet />
                    <InteractAsSheet />
                    <MediaViewer />
                  </TrueSheetProvider>
                </GestureHandlerRootView>
              </QueryClientProvider>
            </DefaultCurrentAccountProvider>
          </KeyboardProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </IntlProvider>
  );
};
