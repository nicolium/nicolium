import get from 'lodash/get';
import React from 'react';

import Toggle from '@/components/ui/toggle';
import { Settings } from '@/schemas/pl-fe/settings';

interface ISettingToggle {
  /** Unique identifier for the Toggle. */
  id?: string;
  /** The full user settings map. */
  settings: Settings;
  /** Array of key names leading into the setting map. */
  settingPath: string[];
  /** Value set if the setting is undefined. */
  defaultValue?: boolean;
  /** Callback when the setting is toggled. */
  onChange: (settingPath: string[], checked: boolean) => void;
  /** Whether the toggle is disabled. */
  disabled?: boolean;
}

/** Stateful toggle to change user settings. */
const SettingToggle: React.FC<ISettingToggle> = ({ id, settings, settingPath, defaultValue, onChange, disabled }) => {

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    onChange(settingPath, target.checked);
  };

  const checked = !!get(settings, settingPath, defaultValue);

  return (
    <Toggle
      id={id}
      checked={checked}
      onChange={handleChange}
      disabled={disabled}
    />
  );
};

export { SettingToggle as default };
