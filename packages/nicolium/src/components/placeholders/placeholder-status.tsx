import clsx from 'clsx';
import React from 'react';

import PlaceholderAvatar from './placeholder-avatar';
import PlaceholderDisplayName from './placeholder-display-name';
import PlaceholderStatusContent from './placeholder-status-content';

interface IPlaceholderStatus {
  variant?: 'rounded' | 'slim' | 'default';
}

/** Fake status to display while data is loading. */
const PlaceholderStatus: React.FC<IPlaceholderStatus> = React.memo(({ variant = 'rounded' }) => (
  <div
    className={clsx('status--placeholder', {
      'status--placeholder--rounded': variant === 'rounded',
      'status--placeholder--slim': variant === 'slim',
    })}
  >
    <div className='status--placeholder__wrapper'>
      <div className='status--placeholder__header'>
        <div className='status--placeholder__avatar'>
          <PlaceholderAvatar size={42} />
        </div>

        <div className='status--placeholder__name'>
          <PlaceholderDisplayName minLength={3} maxLength={25} />
        </div>
      </div>

      <div className='status__content-wrapper status--placeholder__body'>
        <PlaceholderStatusContent minLength={5} maxLength={120} />
      </div>
    </div>
  </div>
));

PlaceholderStatus.displayName = 'PlaceholderStatus';

export { PlaceholderStatus as default };
