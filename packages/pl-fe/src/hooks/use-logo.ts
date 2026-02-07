import { useSettings } from '@/stores/settings';

import { useFrontendConfig } from './use-frontend-config';
import { useTheme } from './use-theme';

const useLogo = () => {
  const { logo, logoDarkMode, logoAlignment } = useFrontendConfig();
  const { demo } = useSettings();

  const darkMode = ['dark', 'black'].includes(useTheme());

  // Use the right logo if provided, otherwise return null;
  const src = (darkMode && logoDarkMode)
    ? logoDarkMode
    : logo || logoDarkMode;

  return { src: demo ? null : src, alignment: logoAlignment };
};

export { useLogo };
