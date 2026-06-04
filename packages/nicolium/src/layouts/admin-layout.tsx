import { Outlet } from '@tanstack/react-router';
import React from 'react';
import StickyBox from 'react-sticky-box';

import Layout, { useWindowControlsOverlay } from '@/components/ui/layout';
import ColumnLoading from '@/features/ui/components/column-loading';

const DashboardPage = React.lazy(() => import('@/pages/dashboard/dashboard'));

const AdminSections = () => {
  const wcoRect = useWindowControlsOverlay();
  const offsetTop = wcoRect && wcoRect.x > 0 ? 16 + wcoRect.y : 16;

  return (
    <aside className='layout__admin-sections'>
      <StickyBox offsetTop={offsetTop}>
        <React.Suspense fallback={<ColumnLoading />}>
          <DashboardPage aside />
        </React.Suspense>
      </StickyBox>
    </aside>
  );
};

const AdminLayout = () => (
  <>
    <AdminSections />

    <Layout.Main>
      <Outlet />
    </Layout.Main>
  </>
);

export { AdminLayout as default };
