import clsx from 'clsx';
import React from 'react';

interface ISelect extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: Iterable<React.ReactNode>;
  full?: boolean;
}

/** Multiple-select dropdown. */
const Select = React.forwardRef<HTMLSelectElement, ISelect>((props, ref) => {
  const { children, className, full = true, ...filteredProps } = props;

  return (
    <select
      ref={ref}
      className={clsx(
        '⁂-select',
        className,
        {
          'w-full': full,
        },
      )}
      {...filteredProps}
    >
      {children}
    </select>
  );
});

export { Select as default };
