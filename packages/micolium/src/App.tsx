import { TrueSheetProvider } from '@lodev09/react-native-true-sheet';
import { PaperProvider } from '@mkljczk/react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeRedirectUri } from 'expo-auth-session';
import { useCalendars, useLocales } from 'expo-localization';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AccountSwitcherBottomSheet } from './components/account-switcher';
import { ComposeBottomSheet } from './components/compose/compose';
import { EmojiPickerBottomSheet } from './components/emoji-picker';
import { InteractAsSheet } from './components/interact-as';
import { MediaViewer } from './components/media-viewer';
import { DefaultCurrentAccountProvider } from './contexts/current-account-context';
import { loadPolyfills } from './polyfills';
import { queryClient } from './queries/client';
import { RootNavigator } from './router/router';
import { AlertRoot } from './stores/alerts';
import { useTheme } from './utils/themes';
import { ToastRoot } from './utils/toast';

import type { ColorSchemeName } from 'react-native';

SplashScreen.preventAutoHideAsync();

const messagesContext = require.context('./messages', false, /\.json$/u, 'lazy');

const locales = messagesContext.keys().map((key) => key.replace(/^\.\/|\.json$/gu, ''));

const loadMessages = (locale: string): Promise<Record<string, string>> =>
  messagesContext(`./${locale}.json`).then(
    (module: { default: Record<string, string> }) => module.default,
  );

const linking = {
  enabled: true,
  filter: (url: string) =>
    !url.startsWith(makeRedirectUri({ scheme: 'micolium', path: 'redirect' })),
};

interface IThemeProvider {
  colorScheme?: ColorSchemeName;
  children: React.ReactNode;
}

const ThemeProvider: React.FC<IThemeProvider> = (props) => {
  const paperTheme = useTheme();

  return (
    <NavigationContainer theme={paperTheme} linking={linking}>
      <PaperProvider theme={paperTheme} {...props} />
    </NavigationContainer>
  );
};

export const App = () => {
  const [{ timeZone }] = useCalendars();
  const [{ languageCode, languageTag }] = useLocales();

  const locale =
    [languageTag, languageCode].find((locale) => locale && locales.includes(locale)) || 'en';

  const [loaded, setLoaded] = React.useState(false);
  const [messages, setMessages] = React.useState<Record<string, string>>();

  React.useEffect(() => {
    loadPolyfills().finally(() => {
      setLoaded(true);
      SplashScreen.hideAsync();
    });
  }, []);

  React.useEffect(() => {
    loadMessages(locale)
      .catch(() => ({}))
      .then(setMessages);
  }, [locale]);

  if (!loaded || !messages) return null;

  return (
    <IntlProvider
      locale={languageCode || 'en'}
      defaultLocale='en'
      timeZone={timeZone || undefined}
      messages={messages}
      onError={() => {}}
    >
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <DefaultCurrentAccountProvider>
            <ThemeProvider>
              <KeyboardProvider>
                <GestureHandlerRootView>
                  <TrueSheetProvider>
                    <RootNavigator />
                    <ToastRoot />
                    <AccountSwitcherBottomSheet />
                    <ComposeBottomSheet />
                    <EmojiPickerBottomSheet />
                    <InteractAsSheet />
                    <MediaViewer />
                    <AlertRoot />
                  </TrueSheetProvider>
                </GestureHandlerRootView>
              </KeyboardProvider>
            </ThemeProvider>
          </DefaultCurrentAccountProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </IntlProvider>
  );
};
