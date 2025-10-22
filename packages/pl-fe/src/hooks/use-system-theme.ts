import { useState, useEffect } from 'react';

import { useSettings } from 'pl-fe/stores/settings';

import type { Theme } from './use-theme';

/** Get the system color scheme of the system. */
const useSystemTheme = (): Theme => {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const [dark, setDark] = useState(query.matches);
  const { theme } = useSettings();

  const handleChange = (event: MediaQueryListEvent) => {
    setDark(event.matches);
  };

  // Older versions of Safari on iOS don't support these events,
  // so try-catch and do nothing.
  useEffect(() => {
    try {
      query.addEventListener('change', handleChange);
    } catch (e) {
      // do nothing
    }

    return () => {
      try {
        query.removeEventListener('change', handleChange);
      } catch (e) {
        // do nothing
      }
    };
  }, []);

  return dark ? (theme?.systemDarkThemePreference || 'black') : 'light';
};

export { useSystemTheme };
