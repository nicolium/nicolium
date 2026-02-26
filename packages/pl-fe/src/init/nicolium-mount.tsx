import React, { Suspense } from 'react';

import LoadingScreen from '@/components/loading-screen';
import { RouterWithContext } from '@/features/ui/router';

/** Highest level node with the Redux store. */
const NicoliumMount = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouterWithContext />
    </Suspense>
  );
};

export { NicoliumMount as default };
