import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { preload } from '@/actions/preload';
import { DefaultCurrentAccountProvider } from '@/contexts/current-account-context';
import { StatProvider } from '@/contexts/stat-context';
import { queryClient } from '@/queries/client';

import NicoliumHead from './nicolium-head';
import NicoliumLoad from './nicolium-load';
import NicoliumMount from './nicolium-mount';
import '../polyfills';

// Preload happens synchronously
preload();

/** The root React node of the application. */
const Nicolium: React.FC = () => (
  <DefaultCurrentAccountProvider>
    <QueryClientProvider client={queryClient}>
      <StatProvider>
        <NicoliumHead />
        <NicoliumLoad>
          <NicoliumMount />
        </NicoliumLoad>
      </StatProvider>
    </QueryClientProvider>
  </DefaultCurrentAccountProvider>
);

export { Nicolium as default };
