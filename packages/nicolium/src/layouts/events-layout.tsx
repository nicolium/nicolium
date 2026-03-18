import { Outlet } from '@tanstack/react-router';
import React from 'react';

import LinkFooter from '@/components/navigation/link-footer';
import Layout from '@/components/ui/layout';
import { WhoToFollowPanel, TrendsPanel, NewEventPanel } from '@/features/ui/util/async-components';
import { useFeatures } from '@/hooks/use-features';

/** Layout to display events list. */
const EventsLayout = () => {
  const features = useFeatures();

  return (
    <>
      <Layout.Main>
        <Outlet />
      </Layout.Main>

      <Layout.Aside>
        <NewEventPanel />
        {features.trends && <TrendsPanel limit={5} />}
        {features.suggestions && <WhoToFollowPanel limit={3} />}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export { EventsLayout as default };
