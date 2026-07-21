import React, { Suspense } from 'react';

import LoadingScreen from '@/components/loading-screen';
import { RouterWithContext } from '@/router';

/** Highest level node with the Redux store. */
const NicoliumMount: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouterWithContext />
    </Suspense>
  );
};

export { NicoliumMount as default };
