import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import copy from '@/utils/copy';

interface ICopyableInput {
  /** Text to be copied. */
  value: string;
  /** Input type. */
  type?: 'text' | 'password';
  /** Callback after the value has been copied. */
  onCopy?(): void;
}

/** An input with copy abilities. */
const CopyableInput: React.FC<ICopyableInput> = ({ value, type = 'text', onCopy }) => {
  const input = useRef<HTMLInputElement>(null);

  const selectInput = () => {
    copy(value, onCopy, input.current);
  };

  return (
    <div className='flex min-w-0 items-center'>
      <Input
        ref={input}
        type={type}
        value={value}
        className='rounded-r-none rtl:rounded-l-none rtl:rounded-r-lg'
        outerClassName='grow min-w-0'
        onClick={selectInput}
        readOnly
      />

      <Button
        theme='primary'
        className='mt-1 h-full rounded-l-none rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none'
        onClick={selectInput}
      >
        <FormattedMessage id='input.copy' defaultMessage='Copy' />
      </Button>
    </div>
  );
};

export { CopyableInput as default };
