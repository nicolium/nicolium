import { Outlet } from '@tanstack/react-router';
import React from 'react';

import Layout from '@/components/ui/layout';
import { useCurrentAccount } from '@/contexts/current-account-context';
import LinkFooter from '@/features/ui/components/link-footer';
import { TrendsPanel, SignUpPanel } from '@/features/ui/util/async-components';
import { useFeatures } from '@/hooks/use-features';
const LandingLayout = () => {
  const me = useCurrentAccount();
  const features = useFeatures();

  return (
    <>
      <Layout.Main className='space-y-3 pt-3 black:divide-gray-800 dark:divide-primary-800 sm:pt-0'>
        <Outlet />
      </Layout.Main>

      <Layout.Aside>
        {!me && <SignUpPanel />}
        {features.trends && <TrendsPanel limit={5} />}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { LandingLayout as default };
