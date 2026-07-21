import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconDesktop from '@phosphor-icons/core/regular/desktop.svg';
import iconMoonStars from '@phosphor-icons/core/regular/moon-stars.svg';
import iconMoon from '@phosphor-icons/core/regular/moon.svg';
import iconSunDim from '@phosphor-icons/core/regular/sun-dim.svg';
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
        return iconDesktop;
      case 'light':
        return iconSunDim;
      case 'dark':
        return iconMoon;
      case 'black':
        return iconMoonStars;
      default:
        return null;
    }
  }, [value]);

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    onChange(e.target.value as any);
  };

  return (
    <div className='theme-selector'>
      <div className='theme-selector__overlay'>
        {themeIconSrc ? <Icon src={themeIconSrc} aria-hidden /> : <div aria-hidden />}
      </div>

      <Select key={value} id={id} onChange={handleChange} defaultValue={value}>
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

      <div className='theme-selector__arrow'>
        <Icon src={iconCaretDown} />
      </div>
    </div>
  );
};

export { ThemeSelector as default };
