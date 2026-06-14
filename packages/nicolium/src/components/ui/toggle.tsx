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
  inverted?: boolean;
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
  inverted,
}) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (inverted) event.target = { ...event.target, checked: !event.target.checked };
    onChange?.(event);
  };

  return (
    <input
      className={`toggle toggle--${size}`}
      type={radio ? 'radio' : 'checkbox'}
      id={id}
      name={name}
      checked={!checked}
      onChange={handleChange}
      required={required}
      disabled={disabled}
      switch={!radio}
    />
  );
};

export { Toggle as default };
