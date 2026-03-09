import clsx from 'clsx';
import React from 'react';

interface IToggle extends Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'id' | 'name' | 'checked' | 'onChange' | 'required' | 'disabled'
> {
  size?: 'sm' | 'md';
  radio?: boolean;
}

/** A glorified checkbox. */
const Toggle: React.FC<IToggle> = ({
  id,
  size = 'md',
  name,
  checked = false,
  onChange,
  required,
  disabled,
  radio,
}) => (
  <input
    className={clsx('⁂-toggle', `⁂-toggle--${size}`, {
      '⁂-toggle--radio': radio,
    })}
    type='checkbox'
    id={id}
    name={name}
    checked={checked}
    onChange={onChange}
    required={required}
    disabled={disabled}
  />
);

export { Toggle as default };
