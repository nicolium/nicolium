import React, { Suspense } from 'react';

import LoadingScreen from 'pl-fe/components/loading-screen';
import SiteErrorBoundary from 'pl-fe/components/site-error-boundary';
import { RouterWithContext } from 'pl-fe/features/ui/router';

/** Highest level node with the Redux store. */
const PlFeMount = () => {

  return (
    <SiteErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <RouterWithContext />
      </Suspense>
    </SiteErrorBoundary>
  );
};

export { PlFeMount as default };
