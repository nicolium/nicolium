import React from 'react';

import PlaceholderAvatar from './placeholder-avatar';
import PlaceholderDisplayName from './placeholder-display-name';
import PlaceholderStatusContent from './placeholder-status-content';

/** Fake notification to display while data is loading. */
const PlaceholderNotification = React.memo(() => (
  <div className='notification--placeholder'>
    <div className='notification--placeholder__wrapper'>
      <div className='notification--placeholder__content'>
        <PlaceholderStatusContent minLength={20} maxLength={20} />
      </div>

      <div>
        <div className='notification--placeholder__account'>
          <div className='notification--placeholder__avatar'>
            <PlaceholderAvatar size={48} />
          </div>

          <div className='notification--placeholder__name'>
            <PlaceholderDisplayName minLength={3} maxLength={25} />
          </div>
        </div>
      </div>

      <div className='notification--placeholder__body'>
        <PlaceholderStatusContent minLength={5} maxLength={120} />
      </div>
    </div>
  </div>
));

PlaceholderNotification.displayName = 'PlaceholderNotification';

export { PlaceholderNotification as default };
