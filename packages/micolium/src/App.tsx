import { TrueSheetProvider } from '@lodev09/react-native-true-sheet';
import { PaperProvider } from '@mkljczk/react-native-paper';
import { getMaterial3Theme } from '@pchmn/expo-material3-theme';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeRedirectUri } from 'expo-auth-session';
import { GlassView } from 'expo-glass-effect';
import { createURL } from 'expo-linking';
import { useCalendars, useLocales } from 'expo-localization';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Platform, useColorScheme } from 'react-native';
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
import { useEnableLiquidGlass } from './hooks/use-enable-liquid-glass';
import { loadPolyfills } from './polyfills';
import { queryClient } from './queries/client';
import { RootNavigator } from './router/router';
import { useSetting } from './stores/settings';
import { hasMigratedFromAsyncStorage, migrateFromAsyncStorage } from './utils/storage-migration';
import { DarkTheme, LightTheme } from './utils/themes';

SplashScreen.preventAutoHideAsync();

const messagesContext = require.context('./messages', false, /\.json$/u, 'lazy');

const locales = messagesContext.keys().map((key) => key.replace(/^\.\/|\.json$/gu, ''));

const loadMessages = (locale: string): Promise<Record<string, string>> =>
  messagesContext(`./${locale}.json`).then(
    (module: { default: Record<string, string> }) => module.default,
  );

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
  const sourceColor = useSetting('appearance.sourceColor');

  const colorScheme = useColorScheme();
  const theme = React.useMemo(() => getMaterial3Theme(sourceColor.slice(0, 7)), [sourceColor]);

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
  const [{ languageCode, languageTag }] = useLocales();
  const glassEffect = useEnableLiquidGlass();

  const locale =
    [languageTag, languageCode].find((locale) => locale && locales.includes(locale)) || 'en';

  const [loaded, setLoaded] = React.useState(false);
  const [messages, setMessages] = React.useState<Record<string, string>>();

  // TODO: Remove `hasMigratedFromAsyncStorage` after a while (when everyone has migrated)
  const [hasMigrated, setHasMigrated] = React.useState(hasMigratedFromAsyncStorage);

  React.useEffect(() => {
    if (!hasMigratedFromAsyncStorage) {
      requestIdleCallback(async () => {
        try {
          await migrateFromAsyncStorage();
          setHasMigrated(true);
        } catch (e) {
          // TODO: fall back to AsyncStorage? Wipe storage clean and use MMKV? Crash app?
        }
      });
    }
  }, []);

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

  if (!loaded || !messages || !hasMigrated) return null;

  return (
    <IntlProvider
      locale={languageCode || 'en'}
      defaultLocale='en'
      timeZone={timeZone || undefined}
      messages={messages}
      onError={() => {}}
    >
      <SafeAreaProvider>
        <ThemeProvider>
          <KeyboardProvider>
            <DefaultCurrentAccountProvider>
              <QueryClientProvider client={queryClient}>
                <GestureHandlerRootView>
                  <TrueSheetProvider>
                    <RootNavigator />
                    <Toaster
                      position={'bottom-center'}
                      enableStacking={Platform.OS === 'ios'}
                      toastOptions={{
                        backgroundComponent: glassEffect ? (
                          <GlassView
                            glassEffectStyle='regular'
                            style={{
                              position: 'absolute',
                              inset: 0,
                              borderRadius: 8,
                            }}
                          />
                        ) : undefined,
                      }}
                    />
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
