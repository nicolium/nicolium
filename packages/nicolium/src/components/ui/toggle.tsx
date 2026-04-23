import React from 'react';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface InputHTMLAttributes<T> {
    switch?: boolean;
  }
}

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
    className={`⁂-toggle ⁂-toggle--${size}`}
    type={radio ? 'radio' : 'checkbox'}
    id={id}
    name={name}
    checked={checked}
    onChange={onChange}
    required={required}
    disabled={disabled}
    switch={!radio}
  />
);

export { Toggle as default };
