import clsx from 'clsx';
import React, { MutableRefObject, useEffect, useState } from 'react';

import Stack from 'pl-fe/components/ui/stack';

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

  const isSubmitDisabled = content.length === 0;

  const submitMessage = () => {
    // dispatch(shoutboxmess)
    // createChatMessage.mutate({ chatId: chat.id, content, mediaId: attachment?.id }, {
    //   onSuccess: () => {
    //     setErrorMessage(undefined);
    //   },
    //   onError: (error: { response: PlfeResponse }, _variables, context) => {
    //     const message = error.response?.json?.error;
    //     setErrorMessage(message || intl.formatMessage(messages.failedToSend));
    //     setContent(context.prevContent as string);
    //   },
    // });

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
      />
    </Stack>
  );
};

export { Shoutbox as default };
