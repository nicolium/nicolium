import { useMemo } from 'react';

import { displayFqn } from '@/utils/state';

import { useAppSelector } from './use-app-selector';
import { useInstance } from './use-instance';
import { useOwnAccount } from './use-own-account';

import type { Account } from 'pl-api';

const useAcct = (account?: Pick<Account, 'fqn' | 'acct' | 'local' | 'url'>): string | undefined => {
  const fqn = useAppSelector((state) => displayFqn(state));
  const instance = useInstance();
  const localUrl = useOwnAccount().account?.url;

  return useMemo(() => {
    if (!account) return;
    if (!fqn) return account.acct;
    const localHost = localUrl ? new URL(localUrl).host : null;
    const otherHost = new URL(account.url).host;
    if (account.local === false || (localHost && localHost !== otherHost)) return account.fqn;
    return `${account.acct}@${instance.domain}`;
  }, [account?.acct, fqn, instance.domain, localUrl]);
};

export {
  useAcct,
};
