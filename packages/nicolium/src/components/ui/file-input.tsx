import React, { forwardRef } from 'react';

interface IFileInput extends Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'required' | 'disabled' | 'name' | 'accept'
> {}

const FileInput = forwardRef<HTMLInputElement, IFileInput>((props, ref) => (
  <input {...props} ref={ref} type='file' className='file-input' />
));

FileInput.displayName = 'FileInput';

export { FileInput as default };
