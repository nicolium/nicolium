import clsx from 'clsx';
import React, { MutableRefObject, useEffect, useState } from 'react';

import Stack from 'pl-fe/components/ui/stack';
import { useCreateShoutboxMessage } from 'pl-fe/stores/shoutbox';

import { clearNativeInputValue } from './chat';
import ShoutboxComposer from './shoutbox-composer';
import ShoutboxMessageList from './shoutbox-message-list';

const fileKeyGen = (): number => Math.floor((Math.random() * 0x10000));

interface ChatInterface {
  inputRef?: MutableRefObject<HTMLTextAreaElement | null>;
  className?: string;
}

const Shoutbox: React.FC<ChatInterface> = ({ inputRef, className }) => {
  const [content, setContent] = useState<string>('');
  const [resetContentKey, setResetContentKey] = useState<number>(fileKeyGen());
  const [errorMessage] = useState<string>();

  const { mutate: createShoutboxMessage } = useCreateShoutboxMessage();

  const isSubmitDisabled = content.length === 0;

  const submitMessage = () => {
    createShoutboxMessage?.(content);

    clearState();
  };

  const clearState = () => {
    if (inputRef?.current) {
      clearNativeInputValue(inputRef.current);
    }
    setContent('');
    setResetContentKey(fileKeyGen());
  };

  const sendMessage = () => {
    if (!isSubmitDisabled) {
      submitMessage();
    }
  };

  const insertLine = () => setContent(content + '\n');

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      insertLine();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleContentChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setContent(event.target.value);
  };

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, [inputRef?.current]);

  return (
    <Stack className={clsx('flex grow overflow-hidden', className)}>
      <div className='flex h-full grow justify-center overflow-hidden'>
        <ShoutboxMessageList />
      </div>

      <ShoutboxComposer
        ref={inputRef}
        onKeyDown={handleKeyDown}
        value={content}
        onChange={handleContentChange}
        onSubmit={sendMessage}
        errorMessage={errorMessage}
        resetContentKey={resetContentKey}
        disabled={!createShoutboxMessage}
      />
    </Stack>
  );
};

export { Shoutbox as default };
