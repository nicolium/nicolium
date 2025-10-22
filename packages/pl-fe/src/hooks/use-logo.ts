import { useSettings } from 'pl-fe/stores/settings';

import { usePlFeConfig } from './use-pl-fe-config';
import { useTheme } from './use-theme';

const useLogo = () => {
  const { logo, logoDarkMode, logoAlignment } = usePlFeConfig();
  const { demo } = useSettings();

  const darkMode = ['dark', 'black'].includes(useTheme());

  // Use the right logo if provided, otherwise return null;
  const src = (darkMode && logoDarkMode)
    ? logoDarkMode
    : logo || logoDarkMode;

  return { src: demo ? null : src, alignment: logoAlignment };
};

export { useLogo };
