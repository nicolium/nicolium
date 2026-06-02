import React from 'react';

interface ICheckbox extends Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'disabled' | 'id' | 'name' | 'onChange' | 'checked' | 'required'
> {}

/** A pretty checkbox input. */
const Checkbox = React.forwardRef<HTMLInputElement, ICheckbox>((props, ref) => (
  <input {...props} ref={ref} type='checkbox' className='checkbox' />
));

Checkbox.displayName = 'Checkbox';

export { Checkbox as default };
