import { Outlet } from '@tanstack/react-router';
import React from 'react';

import LinkFooter from '@/components/navigation/link-footer';
import Layout from '@/components/ui/layout';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { WhoToFollowPanel, TrendsPanel, SignUpPanel } from '@/features/ui/util/async-components';
import { useFeatures } from '@/hooks/use-features';
const StatusLayout = () => {
  const me = useCurrentAccount();
  const features = useFeatures();

  return (
    <>
      <Layout.Main>
        <Outlet />
      </Layout.Main>

      <Layout.Aside>
        {!me && <SignUpPanel />}
        {features.trends && <TrendsPanel limit={5} />}
        {me && features.suggestions && <WhoToFollowPanel limit={3} />}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { StatusLayout as default };
