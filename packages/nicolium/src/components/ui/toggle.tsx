import clsx from 'clsx';
import React, { useRef } from 'react';

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
}) => {
  const input = useRef<HTMLInputElement>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    input.current?.focus();
    input.current?.click();
  };

  return (
    <button
      className={clsx('⁂-toggle', `⁂-toggle--${size}`, {
        '⁂-toggle--radio': radio,
      })}
      onClick={handleClick}
      type='button'
    >
      <div className={radio ? '⁂-toggle__knob--radio' : '⁂-toggle__knob'} />

      <input
        id={id}
        ref={input}
        name={name}
        type='checkbox'
        className='sr-only'
        checked={checked}
        onChange={onChange}
        required={required}
        disabled={disabled}
        tabIndex={-1}
      />
    </button>
  );
};

export { Toggle as default };
