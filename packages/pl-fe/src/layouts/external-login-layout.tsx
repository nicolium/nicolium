import { Outlet } from '@tanstack/react-router';
import React from 'react';

import Layout from '@/components/ui/layout';
import LinkFooter from '@/features/ui/components/link-footer';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
} from '@/features/ui/util/async-components';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useFeatures } from '@/hooks/use-features';
import { isStandalone } from '@/utils/state';

const ExternalLoginLayout = () => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();
  const standalone = useAppSelector(isStandalone);

  return (
    <>
      <Layout.Main>
        <Outlet />
      </Layout.Main>

      <Layout.Aside>
        {!me && !standalone && (
          <SignUpPanel />
        )}
        {features.trends && (
          <TrendsPanel limit={5} />
        )}
        {me && features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export { ExternalLoginLayout as default };
