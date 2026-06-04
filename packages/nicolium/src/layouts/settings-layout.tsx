import { Outlet } from '@tanstack/react-router';
import React from 'react';
import StickyBox from 'react-sticky-box';

import Layout, { useWindowControlsOverlay } from '@/components/ui/layout';
import ColumnLoading from '@/features/ui/components/column-loading';

const SettingsPage = React.lazy(() => import('@/pages/settings/settings'));

const SettingsSections = () => {
  const wcoRect = useWindowControlsOverlay();
  const offsetTop = wcoRect && wcoRect.x > 0 ? 16 + wcoRect.y : 16;

  return (
    <div className='layout__settings-sections'>
      <StickyBox offsetTop={offsetTop}>
        <React.Suspense fallback={<ColumnLoading />}>
          <SettingsPage />
        </React.Suspense>
      </StickyBox>
    </div>
  );
};

const SettingsLayout = () => (
  <>
    <SettingsSections />

    <Layout.Main>
      <Outlet />
    </Layout.Main>
  </>
);

export { SettingsLayout as default };
