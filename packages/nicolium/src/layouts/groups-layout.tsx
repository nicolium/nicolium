import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { AsideContent } from '@/components/navigation/aside-content';
import Column from '@/components/ui/column';
import Layout from '@/components/ui/layout';

/** Layout to display groups. */
const GroupsLayout = () => (
  <>
    <Layout.Main>
      <Column withHeader={false}>
        <div className='layout__main--groups'>
          <Outlet />
        </div>
      </Column>
    </Layout.Main>

    <Layout.Aside>
      <AsideContent layout='groups' />
    </Layout.Aside>
  </>
);

export { GroupsLayout as default };
