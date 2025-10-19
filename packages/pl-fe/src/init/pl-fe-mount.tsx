import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
// @ts-ignore: it doesn't have types
import { ScrollContext } from 'react-router-scroll-4';

import * as BuildConfig from 'pl-fe/build-config';
import LoadingScreen from 'pl-fe/components/loading-screen';
import SiteErrorBoundary from 'pl-fe/components/site-error-boundary';
import { ModalRoot } from 'pl-fe/features/ui/util/async-components';
import { useCachedLocationHandler } from 'pl-fe/utils/redirect';

const UI = React.lazy(() => import('pl-fe/features/ui'));

/** Highest level node with the Redux store. */
const PlFeMount = () => {
  useCachedLocationHandler();

  // @ts-ignore: I don't actually know what these should be, lol
  const shouldUpdateScroll = (prevRouterProps, { location }) =>
    !(location.state?.plFeModalKey && location.state?.plFeModalKey !== prevRouterProps?.location?.state?.plFeModalKey)
    && !(location.state?.plFeDropdownKey && location.state?.plFeDropdownKey !== prevRouterProps?.location?.state?.plFeDropdownKey);

  return (
    <SiteErrorBoundary>
      <BrowserRouter basename={BuildConfig.FE_SUBDIRECTORY}>
        <CompatRouter>
          <ScrollContext shouldUpdateScroll={shouldUpdateScroll}>
            <>
              <Suspense fallback={<LoadingScreen />}>
                <UI />
              </Suspense>

              <Suspense>
                <ModalRoot />
              </Suspense>

              <Toaster
                position='top-right'
                containerClassName='top-4'
              />
            </>
          </ScrollContext>
        </CompatRouter>
      </BrowserRouter>
    </SiteErrorBoundary>
  );
};

export { PlFeMount as default };
