import { ICESHRIMP_NET, MASTODON, type Account } from 'pl-api';

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

/** Get the URL of an account's RSS feed based on the software. */
const getRssUrl = (account: Pick<Account, 'id' | 'url'>, software: string | null): string => {
  switch (software) {
    case ICESHRIMP_NET:
      return `/users/${account.id}/feed.rss`;
    case MASTODON:
      return `${account.url}.rss`;
    default:
      return `${account.url}/feed.rss`;
  }
};

export { getDomain, getBaseURL, getRssUrl };
