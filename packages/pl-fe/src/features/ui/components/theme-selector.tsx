import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from 'pl-fe/components/ui/icon';
import Select from 'pl-fe/components/ui/select';

const messages = defineMessages({
  light: { id: 'theme_toggle.light', defaultMessage: 'Light' },
  dark: { id: 'theme_toggle.dark', defaultMessage: 'Dark' },
  black: { id: 'theme_toggle.black', defaultMessage: 'Black' },
  system: { id: 'theme_toggle.system', defaultMessage: 'System' },
});

interface IThemeSelector {
  value: string;
  onChange: (value: 'system' | 'light' | 'dark' | 'black') => void;
}

/** Pure theme selector. */
const ThemeSelector: React.FC<IThemeSelector> = ({ value, onChange }) => {
  const intl = useIntl();

  const themeIconSrc = useMemo(() => {
    switch (value) {
      case 'system':
        return require('@phosphor-icons/core/regular/desktop.svg');
      case 'light':
        return require('@phosphor-icons/core/regular/sun-dim.svg');
      case 'dark':
        return require('@phosphor-icons/core/regular/moon.svg');
      case 'black':
        return require('@phosphor-icons/core/regular/moon-starsa.svg');
      default:
        return null;
    }
  }, [value]);

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    onChange(e.target.value as any);
  };

  return (
    <label>
      <div className='relative rounded-md shadow-sm'>
        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
          <Icon src={themeIconSrc} className='size-4 text-gray-600 dark:text-gray-700' />
        </div>

        <Select
          onChange={handleChange}
          defaultValue={value}
          className='!pl-10'
        >
          <option value='system'>{intl.formatMessage(messages.system)}</option>
          <option value='light'>{intl.formatMessage(messages.light)}</option>
          <option value='dark'>{intl.formatMessage(messages.dark)}</option>
          <option value='black'>{intl.formatMessage(messages.black)}</option>
        </Select>

        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
          <Icon src={require('@phosphor-icons/core/regular/caret-down.svg')} className='size-4 text-gray-600 dark:text-gray-700' />
        </div>
      </div>
    </label>
  );
};

export { ThemeSelector as default };
