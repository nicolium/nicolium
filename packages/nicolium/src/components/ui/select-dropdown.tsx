import React from 'react';

import Select from '@/components/ui/select';

interface ISelectDropdown {
  className?: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  items: Record<string, string>;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

const SelectDropdown: React.FC<ISelectDropdown> = ({ label, hint, items, ...rest }) => {
  const optionElems = Object.keys(items).map((item) => (
    <option key={item} value={item}>
      {items[item]}
    </option>
  ));

  return <Select {...rest}>{optionElems}</Select>;
};

export { SelectDropdown };
