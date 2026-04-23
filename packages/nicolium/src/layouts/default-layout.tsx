import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { AsideContent } from '@/components/navigation/aside-content';
import Layout from '@/components/ui/layout';

const DefaultLayout: React.FC = () => (
  <>
    <Layout.Main>
      <Outlet />
    </Layout.Main>

    <Layout.Aside>
      <AsideContent layout='default' />
    </Layout.Aside>
  </>
);

export { DefaultLayout as default };
