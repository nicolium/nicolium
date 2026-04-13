import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { AsideContent } from '@/components/navigation/aside-content';
import Layout from '@/components/ui/layout';
import { layouts } from '@/router';

/** Layout for viewing a remote instance timeline. */
const RemoteInstanceLayout = () => {
  const { instance } = layouts.remoteInstance.useParams();

  return (
    <>
      <Layout.Main>
        <Outlet />
      </Layout.Main>

      <Layout.Aside>
        <AsideContent layout='remote-instance' instance={instance} />
      </Layout.Aside>
    </>
  );
};

export { RemoteInstanceLayout as default };
