import { Outlet } from '@tanstack/react-router';
import React from 'react';

import LinkFooter from '@/components/navigation/link-footer';
import Layout from '@/components/ui/layout';
import { layouts } from '@/features/ui/router';
import { PromoPanel, InstanceModerationPanel } from '@/features/ui/util/async-components';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useFederationRestrictionsDisclosed } from '@/utils/state';

/** Layout for viewing a remote instance timeline. */
const RemoteInstanceLayout = () => {
  const { instance } = layouts.remoteInstance.useParams();

  const { data: account } = useOwnAccount();
  const disclosed = useFederationRestrictionsDisclosed();

  return (
    <>
      <Layout.Main>
        <Outlet />
      </Layout.Main>

      <Layout.Aside>
        <PromoPanel />
        {(disclosed || account?.is_admin) && <InstanceModerationPanel host={instance} />}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { RemoteInstanceLayout as default };
