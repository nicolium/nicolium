import React from 'react';

import PlaceholderAvatar from './placeholder-avatar';
import PlaceholderDisplayName from './placeholder-display-name';

/** Fake chat to display while data is loading. */
const PlaceholderChat = () => (
  <div className='chat-list-item--placeholder'>
    <div className='chat-list-item--placeholder__row'>
      <PlaceholderAvatar size={40} />

      <div className='chat-list-item--placeholder__name'>
        <PlaceholderDisplayName minLength={3} maxLength={15} />
      </div>
    </div>
  </div>
);

export { PlaceholderChat as default };
