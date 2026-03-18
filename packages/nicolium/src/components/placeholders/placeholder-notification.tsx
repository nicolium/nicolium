import React from 'react';

import PlaceholderAvatar from './placeholder-avatar';
import PlaceholderDisplayName from './placeholder-display-name';
import PlaceholderStatusContent from './placeholder-status-content';

/** Fake notification to display while data is loading. */
const PlaceholderNotification = React.memo(() => (
  <div className='bg-white p-4 black:bg-black dark:bg-primary-900'>
    <div className='w-full animate-pulse'>
      <div className='mb-2'>
        <PlaceholderStatusContent minLength={20} maxLength={20} />
      </div>

      <div>
        <div className='flex items-center gap-3'>
          <div className='shrink-0'>
            <PlaceholderAvatar size={48} />
          </div>

          <div className='min-w-0 flex-1'>
            <PlaceholderDisplayName minLength={3} maxLength={25} />
          </div>
        </div>
      </div>

      <div className='mt-4'>
        <PlaceholderStatusContent minLength={5} maxLength={120} />
      </div>
    </div>
  </div>
));

PlaceholderNotification.displayName = 'PlaceholderNotification';

export { PlaceholderNotification as default };
