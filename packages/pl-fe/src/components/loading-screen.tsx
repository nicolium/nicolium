import React from 'react';

/** Fullscreen loading indicator. */
const LoadingScreen: React.FC = () => {
  return (
    <div className='loading-indicator-wrapper'>
      <div className='loading-indicator'>
        <div className='loading-indicator__container'>
          <div className='loading-indicator__figure' />
        </div>
      </div>
    </div>
  );
};

export { LoadingScreen as default };
