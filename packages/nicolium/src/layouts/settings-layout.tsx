import { Outlet } from '@tanstack/react-router';
import React from 'react';

import Layout from '@/components/ui/layout';
import SettingsPage from '@/pages/settings/settings';

const SettingsLayout = () => (
  <>
    <div className='⁂-layout__settings-sections'>
      <SettingsPage />
    </div>

    <Layout.Main>
      <Outlet />
    </Layout.Main>
  </>
);

export { SettingsLayout as default };
