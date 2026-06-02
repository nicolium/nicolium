import React, { Suspense } from 'react';

const IconPickerDropdown = React.lazy(() => import('./icon-picker-dropdown'));

interface IIconPicker {
  value: string;
  onChange: (icon: string) => void;
}

const IconPicker: React.FC<IIconPicker> = ({ value, onChange }) => (
  <div className='admin-icon-picker'>
    <Suspense fallback={<div className='admin-icon-picker__fallback' />}>
      <IconPickerDropdown value={value} onPickIcon={onChange} />
    </Suspense>
  </div>
);

export { IconPicker as default };
