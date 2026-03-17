import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  loading: { id: 'loading_indicator.label', defaultMessage: 'Loading…' },
});

/** Fullscreen loading indicator. */
const LoadingScreen: React.FC = () => {
  const intl = useIntl();
  return (
    <div
      className='loading-indicator-wrapper'
      role='status'
      aria-label={intl.formatMessage(messages.loading)}
    >
      <div className='loading-indicator'>
        <div className='loading-indicator__container'>
          <div className='loading-indicator__figure' />
        </div>
      </div>
    </div>
  );
};

export { LoadingScreen as default };
