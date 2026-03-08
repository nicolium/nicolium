import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';
import Select from '@/components/ui/select';

interface IThemeSelector {
  id?: string;
  value: string;
  onChange: (value: 'system' | 'light' | 'dark' | 'black') => void;
}

/** Pure theme selector. */
const ThemeSelector: React.FC<IThemeSelector> = ({ id, value, onChange }) => {
  const themeIconSrc = useMemo(() => {
    switch (value) {
      case 'system':
        return require('@phosphor-icons/core/regular/desktop.svg');
      case 'light':
        return require('@phosphor-icons/core/regular/sun-dim.svg');
      case 'dark':
        return require('@phosphor-icons/core/regular/moon.svg');
      case 'black':
        return require('@phosphor-icons/core/regular/moon-stars.svg');
      default:
        return null;
    }
  }, [value]);

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    onChange(e.target.value as any);
  };

  return (
    <div className='relative rounded-md shadow-sm'>
      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
        <Icon src={themeIconSrc} className='size-4 text-gray-600 dark:text-gray-700' />
      </div>

      <Select key={value} id={id} onChange={handleChange} defaultValue={value} className='!pl-10'>
        <option value='system'>
          <FormattedMessage id='theme_toggle.system' defaultMessage='System' />
        </option>
        <option value='light'>
          <FormattedMessage id='theme_toggle.light' defaultMessage='Light' />
        </option>
        <option value='dark'>
          <FormattedMessage id='theme_toggle.dark' defaultMessage='Dark' />
        </option>
        <option value='black'>
          <FormattedMessage id='theme_toggle.black' defaultMessage='Black' />
        </option>
      </Select>

      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
        <Icon
          src={require('@phosphor-icons/core/regular/caret-down.svg')}
          className='size-4 text-gray-600 dark:text-gray-700'
        />
      </div>
    </div>
  );
};

export { ThemeSelector as default };
