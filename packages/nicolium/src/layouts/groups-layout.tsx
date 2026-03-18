import { Outlet } from '@tanstack/react-router';
import React from 'react';

import LinkFooter from '@/components/navigation/link-footer';
import Column from '@/components/ui/column';
import Layout from '@/components/ui/layout';
import { MyGroupsPanel, NewGroupPanel } from '@/features/ui/util/async-components';

/** Layout to display groups. */
const GroupsLayout = () => (
  <>
    <Layout.Main>
      <Column withHeader={false}>
        <div className='space-y-4'>
          <Outlet />
        </div>
      </Column>
    </Layout.Main>

    <Layout.Aside>
      <NewGroupPanel />
      <MyGroupsPanel />

      <LinkFooter />
    </Layout.Aside>
  </>
);

export { GroupsLayout as default };
