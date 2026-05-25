import React from 'react';

/** Fullscreen loading indicator. */
const LoadingScreen: React.FC = () => (
  <div className='loading-indicator__wrapper' role='status' aria-label='Loading…'>
    <div className='loading-indicator'>
      <div className='loading-indicator__container'>
        <div className='loading-indicator__figure' />
      </div>
    </div>
  </div>
);

export { LoadingScreen as default };
