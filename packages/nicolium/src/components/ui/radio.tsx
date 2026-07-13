import React from 'react';

import List, { type IListItem, ListItem } from '../list';

interface IRadioGroup {
  onChange: React.ChangeEventHandler;
  disabled?: boolean;
  children: React.ReactElement<{ onChange: React.ChangeEventHandler; disabled?: boolean }>[];
}

const RadioGroup = ({ onChange, disabled, children }: IRadioGroup) => {
  const childrenWithProps = React.Children.map(children, (child) =>
    React.cloneElement(child, { onChange, disabled }),
  );

  return <List>{childrenWithProps}</List>;
};

type IRadioItem = IListItem & {
  label: React.ReactNode;
  hint?: React.ReactNode;
  value: string;
  checked: boolean;
  onChange?: React.ChangeEventHandler;
};

const RadioItem: React.FC<IRadioItem> = ({
  label,
  hint,
  checked = false,
  onChange,
  value,
  ...props
}) => (
  <ListItem className='radio-item' label={label} hint={hint} {...props}>
    <input
      type='radio'
      checked={checked}
      onChange={onChange}
      value={value}
      disabled={props.disabled}
    />
  </ListItem>
);

export { RadioGroup, RadioItem };
