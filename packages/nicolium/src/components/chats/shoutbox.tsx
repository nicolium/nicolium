import clsx from 'clsx';
import React, { type RefObject, useEffect, useState } from 'react';

import { useCreateShoutboxMessage } from '@/stores/shoutbox';

import { clearNativeInputValue } from './chat';
import ShoutboxComposer from './shoutbox-composer';
import ShoutboxMessageList from './shoutbox-message-list';

const fileKeyGen = (): number => Math.floor(Math.random() * 0x10000);

interface IShoutbox {
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  className?: string;
  widget?: boolean;
}

const Shoutbox: React.FC<IShoutbox> = ({ inputRef, className, widget }) => {
  const [content, setContent] = useState<string>('');
  const [resetContentKey, setResetContentKey] = useState<number>(fileKeyGen());

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

  const insertLine = () => {
    setContent(content + '\n');
  };

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
    <div className={clsx('chat', widget && 'shoutbox-widget', className)}>
      <div className='chat__messages'>
        <ShoutboxMessageList />
      </div>

      <ShoutboxComposer
        ref={inputRef}
        onKeyDown={handleKeyDown}
        value={content}
        onChange={handleContentChange}
        onSubmit={sendMessage}
        resetContentKey={resetContentKey}
        disabled={!createShoutboxMessage}
        widget={widget}
      />
    </div>
  );
};

export { Shoutbox as default };
