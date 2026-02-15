import React, { Suspense } from 'react';

import LoadingScreen from '@/components/loading-screen';
import { RouterWithContext } from '@/features/ui/router';

/** Highest level node with the Redux store. */
const PlFeMount = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouterWithContext />
    </Suspense>
  );
};

export { PlFeMount as default };
