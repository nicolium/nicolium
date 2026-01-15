import { displayFqn } from 'pl-fe/utils/state';

import { useAppSelector } from './use-app-selector';
import { useInstance } from './use-instance';

import type { Account } from 'pl-api';

const useAcct = (account?: Pick<Account, 'fqn' | 'acct' | 'local'>): string | undefined => {
  const fqn = useAppSelector((state) => displayFqn(state));
  const instance = useInstance();

  if (!account) return;
  if (!fqn) return account.acct;
  if (account.local === false) return account.fqn;
  return `${account.acct}@${instance.domain}`;
};

export {
  useAcct,
};
