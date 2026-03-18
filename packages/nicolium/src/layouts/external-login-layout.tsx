import { Outlet } from '@tanstack/react-router';
import React from 'react';

import LinkFooter from '@/components/navigation/link-footer';
import Layout from '@/components/ui/layout';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { WhoToFollowPanel, TrendsPanel, SignUpPanel } from '@/features/ui/util/async-components';
import { useFeatures } from '@/hooks/use-features';
import { useIsStandalone } from '@/utils/state';

const ExternalLoginLayout = () => {
  const me = useCurrentAccount();
  const features = useFeatures();
  const standalone = useIsStandalone();

  return (
    <>
      <Layout.Main>
        <Outlet />
      </Layout.Main>

      <Layout.Aside>
        {!me && !standalone && <SignUpPanel />}
        {features.trends && <TrendsPanel limit={5} />}
        {me && features.suggestions && <WhoToFollowPanel limit={3} />}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export { ExternalLoginLayout as default };
