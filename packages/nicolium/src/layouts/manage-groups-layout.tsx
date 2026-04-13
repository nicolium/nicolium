import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { AsideContent } from '@/components/navigation/aside-content';
import Layout from '@/components/ui/layout';

/** Layout to display groups. */
const ManageGroupsLayout = () => (
  <>
    <Layout.Main>
      <Outlet />
    </Layout.Main>

    <Layout.Aside>
      <AsideContent layout='groups' />
    </Layout.Aside>
  </>
);

export { ManageGroupsLayout as default };
