import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { AsideContent } from '@/components/navigation/aside-content';
import Layout from '@/components/ui/layout';

const ExternalLoginLayout = () => (
  <>
    <Layout.Main>
      <Outlet />
    </Layout.Main>

    <Layout.Aside>
      <AsideContent layout='external-login' />
    </Layout.Aside>
  </>
);

export { ExternalLoginLayout as default };
