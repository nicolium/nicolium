import React from 'react';

import PlaceholderAvatar from './placeholder-avatar';
import PlaceholderDisplayName from './placeholder-display-name';

/** Fake chat to display while data is loading. */
const PlaceholderChat = () => (
  <div className='flex w-full animate-pulse flex-col px-4 py-2'>
    <div className='flex items-center gap-2'>
      <PlaceholderAvatar size={40} />

      <div className='flex flex-col items-start'>
        <PlaceholderDisplayName minLength={3} maxLength={15} />
      </div>
    </div>
  </div>
);

export { PlaceholderChat as default };
