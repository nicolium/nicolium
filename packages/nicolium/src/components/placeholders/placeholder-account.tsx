import React from 'react';

import PlaceholderAvatar from './placeholder-avatar';
import PlaceholderDisplayName from './placeholder-display-name';

/** Fake account to display while data is loading. */
const PlaceholderAccount: React.FC = React.memo(() => (
  <div className='flex items-center gap-3'>
    <div className='shrink-0'>
      <PlaceholderAvatar size={42} />
    </div>

    <div className='min-w-0 flex-1'>
      <PlaceholderDisplayName minLength={3} maxLength={25} />
    </div>
  </div>
));

PlaceholderAccount.displayName = 'PlaceholderAccount';

export { PlaceholderAccount as default };
