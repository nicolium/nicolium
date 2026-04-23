import { lazyRouteComponent, type LinkProps, Navigate } from '@tanstack/react-router';
import React from 'react';

import { WITH_LANDING_PAGE } from '@/build-config';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useSettings } from '@/stores/settings';
import { useIsStandalone } from '@/utils/state';

const getTimelineLink = (timeline: string): LinkProps => {
  const idParam = timeline.split(':')[1];

  if (timeline === 'local') return { to: '/timeline/local' };
  if (timeline === 'bubble') return { to: '/timeline/bubble' };
  if (timeline === 'federated') return { to: '/timeline/fediverse' };
  if (timeline === 'wrenched') return { to: '/timeline/wrenched' };
  if (timeline.startsWith('list:')) return { to: `/list/$listId`, params: { listId: idParam } };
  if (timeline.startsWith('circle:'))
    return { to: `/circles/$circleId`, params: { circleId: idParam } };
  if (timeline.startsWith('antenna:'))
    return { to: `/antennas/$antennaId`, params: { antennaId: idParam } };
  if (timeline.startsWith('instance:'))
    return { to: `/timeline/$instance`, params: { instance: idParam } };
  return { to: '/timeline/home' };
};

const HomeTimeline = lazyRouteComponent(() => import('@/pages/timelines/home-timeline'));
const LandingPage = lazyRouteComponent(() => import('@/pages/instance/landing'));
const LandingTimeline = lazyRouteComponent(() => import('@/pages/timelines/landing-timeline'));

const HomeRoute = () => {
  const { redirectRootNoLogin } = useFrontendConfig();
  const standalone = useIsStandalone();
  const { isLoggedIn } = useLoggedIn();
  const { defaultTimeline } = useSettings();

  if (!isLoggedIn && redirectRootNoLogin) return <Navigate to={redirectRootNoLogin} replace />;
  if (standalone && !isLoggedIn && !WITH_LANDING_PAGE) {
    return <Navigate to='/login/external' replace />;
  }
  if (isLoggedIn) {
    if (defaultTimeline === 'home') return <HomeTimeline />;
    return <Navigate {...getTimelineLink(defaultTimeline)} replace />;
  }
  if (standalone && WITH_LANDING_PAGE) return <LandingPage />;
  return <LandingTimeline />;
};

export { HomeRoute as default };
