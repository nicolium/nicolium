import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { Linking } from 'react-native';

import { useSettingsStore } from '@/stores/settings';

const openUrl = (url: string) => {
  if (useSettingsStore.getState().settings['general.useInAppBrowser']) {
    return openBrowserAsync(url, {
      dismissButtonStyle: 'close',
      presentationStyle: WebBrowserPresentationStyle.PAGE_SHEET,
    });
  } else {
    Linking.openURL(url);
  }
};

export { openUrl };
