import React from 'react';

import { changeSetting } from '@/actions/settings';
import { useSettings } from '@/stores/settings';

import ThemeSelector from './theme-selector';

interface IThemeToggle {
  id?: string;
}

/** Stateful theme selector. */
const ThemeToggle: React.FC<IThemeToggle> = ({ id }) => {
  const { themeMode } = useSettings();

  const handleChange = (themeMode: string) => {
    changeSetting(['themeMode'], themeMode);
  };

  return <ThemeSelector id={id} value={themeMode} onChange={handleChange} />;
};

export { ThemeToggle as default };
