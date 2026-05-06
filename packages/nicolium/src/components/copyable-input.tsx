import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

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
    <div className='⁂-copyable-input'>
      <Input ref={input} type={type} value={value} onClick={selectInput} readOnly />

      <button onClick={selectInput}>
        <FormattedMessage id='input.copy' defaultMessage='Copy' />
      </button>
    </div>
  );
};

export { CopyableInput as default };
