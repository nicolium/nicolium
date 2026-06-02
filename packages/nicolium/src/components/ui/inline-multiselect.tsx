import React from 'react';

interface IInlineMultiselect<T extends string> {
  items: Record<T, string>;
  value?: T[];
  onChange: (values: T[]) => void;
  disabled?: boolean;
}

/** Allows to select many of available options. */
const InlineMultiselect = <T extends string>({
  items,
  value,
  onChange,
  disabled,
}: IInlineMultiselect<T>) => (
  <div className='inline-multiselect'>
    {Object.entries(items).map(([key, label]) => {
      const checked = value?.includes(key as T);

      return (
        <label key={key}>
          <input
            name={key}
            type='checkbox'
            className='sr-only'
            checked={checked}
            onChange={({ target }) => {
              onChange(
                (target.checked
                  ? [...(value ?? []), target.name]
                  : (value?.filter((key) => key !== target.name) ?? [])) as Array<T>,
              );
            }}
            disabled={disabled}
          />
          {label as string}
        </label>
      );
    })}
  </div>
);

export { InlineMultiselect };
