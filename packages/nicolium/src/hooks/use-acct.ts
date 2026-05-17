import { useMemo } from 'react';

import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';

import { useOwnAccount } from './use-own-account';

import type { Account } from 'pl-api';

const useAcct = (account?: Pick<Account, 'fqn' | 'acct' | 'local' | 'url'>): string | undefined => {
  const { displayFqn: fqn } = useSettings();
  const instance = useInstance();
  const localUrl = useOwnAccount().data?.url;

  return useMemo(() => {
    if (!account) return;
    if (!fqn) return account.acct;
    const localHost = localUrl ? new URL(localUrl).host : null;
    const otherHost = new URL(account.url).host;
    if (account.local === false || (localHost && localHost !== otherHost)) return account.fqn;
    return `${account.acct}@${instance.domain}`;
  }, [account?.acct, fqn, instance.domain, localUrl]);
};

export { useAcct };
