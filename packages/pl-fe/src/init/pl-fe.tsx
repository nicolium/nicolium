import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';

import { DefaultCurrentAccountProvider } from '@/contexts/current-account-context';
import { StatProvider } from '@/contexts/stat-context';
import { queryClient } from '@/queries/client';

import { preload } from '../actions/preload';
import { store } from '../store';

import PlFeHead from './pl-fe-head';
import PlFeLoad from './pl-fe-load';
import PlFeMount from './pl-fe-mount';

// Preload happens synchronously
store.dispatch(preload() as any);

/** The root React node of the application. */
const PlFe: React.FC = () => (
  <>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <DefaultCurrentAccountProvider>
          <StatProvider>
            <HelmetProvider>
              <PlFeHead />
              <PlFeLoad>
                <PlFeMount />
              </PlFeLoad>
            </HelmetProvider>
          </StatProvider>
        </DefaultCurrentAccountProvider>
      </QueryClientProvider>
    </Provider>
  </>
);

export { PlFe as default };
