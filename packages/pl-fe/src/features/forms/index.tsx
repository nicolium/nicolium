import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Multiselect as Ms } from 'pl-fe/components/ui/multiselect';
import Select from 'pl-fe/components/ui/select';

const messages = defineMessages({
  selectPlaceholder: { id: 'select.placeholder', defaultMessage: 'Select' },
  selectNoOptions: { id: 'select.no_options', defaultMessage: 'No options available' },
});

interface ISelectDropdown {
  className?: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  items: Record<string, string>;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

const SelectDropdown: React.FC<ISelectDropdown> = (props) => {
  const { label, hint, items, ...rest } = props;

  const optionElems = Object.keys(items).map(item => (
    <option key={item} value={item}>{items[item]}</option>
  ));

  return <Select {...rest}>{optionElems}</Select>;
};

interface IMultiselect {
  className?: string;
  items: Record<string, string>;
  value?: string[];
  onChange?: ((values: string[]) => void);
  disabled?: boolean;
}

const Multiselect: React.FC<IMultiselect> = (props) => {
  const intl = useIntl();
  const { items, value, onChange, disabled } = props;

  const options = useMemo(() => Object.entries(items).map(([key, value]) => ({ key, value })), [items]);
  const selectedValues = value?.map(key => options.find(option => option.key === key)).filter(value => value);

  const handleChange = (values: Record<'key' | 'value', string>[]) => {
    onChange?.(values.map(({ key }) => key));
  };

  return (
    <Ms
      className='plfe-multiselect'
      options={options}
      selectedValues={selectedValues}
      onSelect={handleChange}
      onRemove={handleChange}
      displayValue='value'
      disabled={disabled}
      placeholder={intl.formatMessage(messages.selectPlaceholder)}
      emptyRecordMsg={intl.formatMessage(messages.selectNoOptions)}
    />
  );
};

export {
  Multiselect,
  SelectDropdown,
};
