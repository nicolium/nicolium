import { Outlet } from '@tanstack/react-router';
import React from 'react';
import StickyBox from 'react-sticky-box';

import Layout, { useWindowControlsOverlay } from '@/components/ui/layout';
import SettingsPage from '@/pages/settings/settings';

const SettingsSections = () => {
  const wcoRect = useWindowControlsOverlay();
  const offsetTop = wcoRect && wcoRect.x > 0 ? 16 + wcoRect.y : 16;

  return (
    <div className='⁂-layout__settings-sections'>
      <StickyBox offsetTop={offsetTop}>
        <SettingsPage />
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
