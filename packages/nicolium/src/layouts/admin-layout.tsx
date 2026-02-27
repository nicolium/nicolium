import { Outlet } from '@tanstack/react-router';
import React from 'react';

import Layout from '@/components/ui/layout';
import { LatestAccountsPanel } from '@/features/ui/util/async-components';

import LinkFooter from '../features/ui/components/link-footer';

const AdminLayout = () => (
  <>
    <Layout.Main>
      <Outlet />
    </Layout.Main>

    <Layout.Aside>
      <LatestAccountsPanel limit={5} />
      <LinkFooter />
    </Layout.Aside>
  </>
);

export { AdminLayout as default };
