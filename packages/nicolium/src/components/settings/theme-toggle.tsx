import React from 'react';

import { changeSetting as defaultChangeSetting } from '@/actions/settings';
import { useSettings } from '@/stores/settings';

import ThemeSelector from './theme-selector';

interface IThemeToggle {
  id?: string;
  changeSetting?: typeof defaultChangeSetting;
  settings?: ReturnType<typeof useSettings>;
}

/** Stateful theme selector. */
const ThemeToggle: React.FC<IThemeToggle> = ({
  id,
  changeSetting = defaultChangeSetting,
  settings: settingsProp,
}) => {
  const settings = useSettings();
  const { themeMode } = settingsProp || settings;

  const handleChange = (themeMode: string) => {
    changeSetting(['themeMode'], themeMode);
  };

  return <ThemeSelector id={id} value={themeMode} onChange={handleChange} />;
};

export { ThemeToggle as default };
