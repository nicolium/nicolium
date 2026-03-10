import { useQueryClient } from '@tanstack/react-query';

import { useInstance } from '@/hooks/use-instance';
import { useAdminConfig } from '@/queries/admin/use-config';
import { queryKeys } from '@/queries/keys';
import { getDomain } from '@/utils/accounts';
import ConfigDB from '@/utils/config-db';

import type { MRFSimple } from '@/schemas/pleroma';
import type { Account } from 'pl-api';

type HostFederation = {
  [key in keyof MRFSimple]: boolean;
};

interface RemoteInstance {
  host: string;
  favicon: string | null;
  federation: HostFederation;
}

const useSimplePolicy = () => {
  const { data: config } = useAdminConfig();
  const simplePolicy = useInstance().pleroma.metadata.federation.mrf_simple_info;

  return {
    ...simplePolicy,
    ...ConfigDB.toSimplePolicy(config?.configs || []),
  };
};

const useRemoteInstanceFederation = (host: string) => {
  const simplePolicy = useSimplePolicy();

  return Object.fromEntries(
    Object.entries(simplePolicy).map(([key, hosts]) => [
      key,
      hosts.some((entry) => entry[0] === host),
    ]),
  ) as HostFederation;
};

const useRemoteInstanceFavicon = (host: string) => {
  const queryClient = useQueryClient();

  return (
    queryClient
      .getQueriesData<Account>({ queryKey: queryKeys.accounts.root })
      .map(([, account]) => account)
      .find(
        (account): account is Account =>
          typeof account?.id === 'string' && getDomain(account) === host,
      )?.favicon ?? null
  );
};

const useRemoteInstance = (host: string) => {
  const federation = useRemoteInstanceFederation(host);
  const favicon = useRemoteInstanceFavicon(host);

  return {
    host,
    favicon,
    federation,
  };
};

const useHosts = () => {
  const simplePolicy = useSimplePolicy();

  return [
    ...new Set(Object.values(simplePolicy).reduce((acc, hosts) => (acc.push(...hosts), acc), [])),
  ].toSorted();
};

export { type RemoteInstance, useHosts, useRemoteInstance };
