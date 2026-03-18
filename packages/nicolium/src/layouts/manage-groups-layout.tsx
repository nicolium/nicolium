import { Outlet } from '@tanstack/react-router';
import React from 'react';

import LinkFooter from '@/components/navigation/link-footer';
import Layout from '@/components/ui/layout';
import { MyGroupsPanel, NewGroupPanel } from '@/features/ui/util/async-components';

/** Layout to display groups. */
const ManageGroupsLayout = () => (
  <>
    <Layout.Main>
      <Outlet />
    </Layout.Main>

    <Layout.Aside>
      <NewGroupPanel />
      <MyGroupsPanel />
      <LinkFooter />
    </Layout.Aside>
  </>
);

export { ManageGroupsLayout as default };
