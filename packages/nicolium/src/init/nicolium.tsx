import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Provider } from 'react-redux';

import { preload } from '@/actions/preload';
import { DefaultCurrentAccountProvider } from '@/contexts/current-account-context';
import { StatProvider } from '@/contexts/stat-context';
import { queryClient } from '@/queries/client';
import { store } from '@/store';

import NicoliumHead from './nicolium-head';
import NicoliumLoad from './nicolium-load';
import NicoliumMount from './nicolium-mount';
import '../polyfills';

// Preload happens synchronously
store.dispatch(preload());

/** The root React node of the application. */
const Nicolium: React.FC = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <DefaultCurrentAccountProvider>
        <StatProvider>
          <NicoliumHead />
          <NicoliumLoad>
            <NicoliumMount />
          </NicoliumLoad>
        </StatProvider>
      </DefaultCurrentAccountProvider>
    </QueryClientProvider>
  </Provider>
);

export { Nicolium as default };
