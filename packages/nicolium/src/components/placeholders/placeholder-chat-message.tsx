import clsx from 'clsx';
import React from 'react';

import Text from '@/components/ui/text';
import { randomIntFromInterval } from '@/utils/placeholders';

import PlaceholderAvatar from './placeholder-avatar';

/** Fake chat to display while data is loading. */
const PlaceholderChatMessage = ({ isMyMessage = false }: { isMyMessage?: boolean }) => {
  const messageLength = randomIntFromInterval(160, 220);

  return (
    <div
      data-testid='placeholder-chat-message'
      className={clsx({
        'flex max-w-[85%] flex-col gap-1 no-reduce-motion:animate-pulse': true,
        'ml-auto': isMyMessage,
      })}
    >
      <div
        className={clsx('flex items-center', {
          'justify-end': isMyMessage,
          'justify-start': !isMyMessage,
        })}
      >
        <div
          className={clsx({
            'relative text-ellipsis break-words rounded-md p-2': true,
            'mr-2': isMyMessage,
            'order-2 ml-2': !isMyMessage,
          })}
        >
          <div
            style={{ width: messageLength, height: 20 }}
            className='rounded-full bg-primary-50 dark:bg-primary-800'
          />
        </div>

        <div className={clsx({ 'order-1': !isMyMessage })}>
          <PlaceholderAvatar size={34} />
        </div>
      </div>

      <div
        className={clsx('flex items-center gap-2', {
          'ml-auto': isMyMessage,
        })}
      >
        <Text
          theme='muted'
          size='xs'
          className={clsx({
            'text-right': isMyMessage,
            'order-2': !isMyMessage,
          })}
        >
          <span
            style={{ width: 50, height: 12 }}
            className='block rounded-full bg-primary-50 dark:bg-primary-800'
          />
        </Text>

        <div className={clsx({ 'order-1': !isMyMessage })}>
          <div className='ml-2 w-[34px]' />
        </div>
      </div>
    </div>
  );
};

export { PlaceholderChatMessage as default };
