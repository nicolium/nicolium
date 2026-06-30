import clsx from 'clsx';
import React from 'react';

import { randomIntFromInterval } from '@/utils/placeholders';

import PlaceholderAvatar from './placeholder-avatar';

/** Fake chat to display while data is loading. */
const PlaceholderChatMessage = ({ isMyMessage = false }: { isMyMessage?: boolean }) => {
  const messageLength = randomIntFromInterval(160, 220);

  return (
    <div
      data-testid='placeholder-chat-message'
      className={clsx('chat-message__container chat-message--placeholder', {
        'chat-message--placeholder--mine': isMyMessage,
      })}
    >
      <div className='chat-message--placeholder__row'>
        <div
          className={clsx('chat-message--placeholder__bubble', {
            'chat-message--placeholder__bubble--mine': isMyMessage,
            'chat-message--placeholder__bubble--theirs': !isMyMessage,
          })}
        >
          <div
            style={{ width: messageLength, height: 20 }}
            className='chat-message--placeholder__text-block'
          />
        </div>

        <div className={clsx({ 'chat-message--placeholder__avatar--first': !isMyMessage })}>
          <PlaceholderAvatar size={34} />
        </div>
      </div>

      <div
        className={clsx('chat-message--placeholder__meta', {
          'chat-message--placeholder__meta--mine': isMyMessage,
        })}
      >
        <span
          className={clsx({
            'chat-message--placeholder__timestamp--mine': isMyMessage,
            'chat-message--placeholder__timestamp--theirs': !isMyMessage,
          })}
        >
          <span
            style={{ width: 50, height: 12 }}
            className='chat-message--placeholder__timestamp-block'
          />
        </span>

        <div className={clsx({ 'chat-message--placeholder__spacer-wrapper': !isMyMessage })}>
          <div className='chat-message--placeholder__spacer' />
        </div>
      </div>
    </div>
  );
};

export { PlaceholderChatMessage as default };
