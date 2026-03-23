import { lazyRouteComponent, Navigate } from '@tanstack/react-router';
import React from 'react';

import { WITH_LANDING_PAGE } from '@/build-config';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useIsStandalone } from '@/utils/state';

const HomeTimeline = lazyRouteComponent(() => import('@/pages/timelines/home-timeline'));
const LandingPage = lazyRouteComponent(() => import('@/pages/instance/landing'));
const LandingTimeline = lazyRouteComponent(() => import('@/pages/timelines/landing-timeline'));

const HomeRoute = () => {
  const { redirectRootNoLogin } = useFrontendConfig();
  const standalone = useIsStandalone();
  const { isLoggedIn } = useLoggedIn();

  if (!isLoggedIn && redirectRootNoLogin) return <Navigate to={redirectRootNoLogin} replace />;
  if (standalone && !isLoggedIn && !WITH_LANDING_PAGE)
    return <Navigate to='/login/external' replace />;

  if (isLoggedIn) return <HomeTimeline />;
  if (standalone && WITH_LANDING_PAGE) return <LandingPage />;
  return <LandingTimeline />;
};

export { HomeRoute as default };
