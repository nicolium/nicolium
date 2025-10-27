import range from 'lodash/range';

import type { Account } from 'pl-fe/normalizers/account';

const getDomainFromURL = (account: Pick<Account, 'url'>): string => {
  try {
    const url = account.url;
    return new URL(url).host;
  } catch {
    return '';
  }
};

const getDomain = (account: Pick<Account, 'acct' | 'url'>): string => {
  const domain = account.acct.split('@')[1];
  return domain ? domain : getDomainFromURL(account);
};

const getBaseURL = (account: Pick<Account, 'url'>): string => {
  try {
    return new URL(account.url).origin;
  } catch {
    return '';
  }
};

const getAcct = (account: Pick<Account, 'fqn' | 'acct'>, displayFqn: boolean): string => (
  displayFqn === true ? account.fqn : account.acct
);

export {
  getDomain,
  getBaseURL,
  getAcct,
};
