import React from 'react';

/**
 * IntentionalError:
 * For testing logging/monitoring & previewing ErrorBoundary design.
 */
const IntentionalErrorPage: React.FC = () => {
  throw new Error('This error is intentional.');
};

export { IntentionalErrorPage as default };
